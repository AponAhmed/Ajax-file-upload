//attach
function sendFileToServer(formData, status, file, url) {
    var uploadURL = "index.php?ajxurl=" + url; //Upload URL
    var extraData = {}; //Extra Data.
    var jqXHR = $.ajax({
        xhr: function() {
            var xhrobj = $.ajaxSettings.xhr();
            if (xhrobj.upload) {
                xhrobj.upload.addEventListener('progress', function(event) {
                    var percent = 0;
                    var position = event.loaded || event.position;
                    var total = event.total;
                    if (event.lengthComputable) {
                        percent = Math.ceil(position / total * 100);
                    }
                    //Set progress
                    status.setProgress(percent);
                }, false);
            }
            return xhrobj;
        },
        url: uploadURL,
        type: "POST",
        contentType: false,
        processData: false,
        cache: false,
        data: formData,
        dataType: "json",
        success: function(data) {
            if (data['error'] == "") {
                status.appendIC(data['icon'])//alert(data['icon']);
                status.setFileNameSize(data['fname'].split(",")[0], file.size);
                status.appendFN(data['fname']);
                status.setProgress(100);
            }
            else {
                //alert(data['error']);
                status.errorMsg();
            }
        }
    });
    status.setAbort(jqXHR);
}
function createStatusbar(obj, url) {
    this.statusbar = $("<div class='singAtt'  id='' data-toggle='tooltip' data-placement='top' title=''></div>");
    this.fileicon = $("<div class='fileicon'></div>").appendTo(this.statusbar);
    this.filename = $("<div class='filename'></div>").appendTo(this.statusbar);
    //this.size = $("<div class='filesize'></div>").appendTo(this.statusbar);
    this.abort = $("<div class='abort pull-right'>&times;</div>").appendTo(this.statusbar);
    this.progressBar = $("<div class='AttprogressBar'><div></div></div>").appendTo(this.statusbar);
    obj.append(this.statusbar);
    this.appendIC = function(icon)
    {
        this.fileicon.append(icon);
    }
    this.setFileNameSize = function(name, size)
    {
        var sizeStr = "";
        var sizeKB = size / 1024;
        if (parseInt(sizeKB) > 1024)
        {
            var sizeMB = sizeKB / 1024;
            sizeStr = sizeMB.toFixed(2) + " MB";
        }
        else
        {
            sizeStr = sizeKB.toFixed(2) + " KB";
        }
        if (name.length > 18) {
            name = name.substr(0, 17) + "...";
        }
        this.filename.html(name);
        this.statusbar.attr("title", sizeStr);
        this.statusbar.attr("sizev", size);
        $("#attach_size").attr("sizev", parseInt($("#attach_size").attr("sizev")) + size);
        this.setTotalSize();
        $(function() {
            $('[data-toggle="tooltip"]').tooltip()
        })
    }
    this.setTotalSize = function()
    {
        //set total size
        var size = parseInt($("#attach_size").attr("sizev"));

        var sizeStr = "";
        var sizeKB = size / 1024;
        if (parseInt(sizeKB) > 1024)
        {
            var sizeMB = sizeKB / 1024;
            sizeStr = sizeMB.toFixed(2) + " MB";
        }
        else
        {
            sizeStr = sizeKB.toFixed(2) + " KB";
        }
        if (sizeStr != "" && size > 0)
            $("#attach_size").html("(" + sizeStr + ")");
        else
            $("#attach_size").html("");
    }
    this.setProgress = function(progress)
    {
        var progressBarWidth = progress + "%";
        this.progressBar.find('div').animate({width: progressBarWidth}, 10).html(progress + "%");
        if (parseInt(progress) >= 100)
        {
            this.progressBar.hide();
//            if ($.isFunction(tinymce.get))
//                tinymce.get('mail_body').isNotDirty = 0;
            $("#save_status").html("Not saved");

            //this.abort.hide();
        }
        else {
//            if ($.isFunction(tinymce.get))
//                tinymce.get('mail_body').isNotDirty = 1;
            $("#save_status").html("Not saved");
        }
    }
    this.setAbortFD = function()
    {
        var sb = this.statusbar;
        var ts = this;
        this.abort.click(function()
        {
            $.ajax({
                type: "POST",
                url: "index.php?ajxurl=" + url,
                data: "fname=" + sb.children(".filename").children("input").val(),
                //dataType: "json",
                success: function(data) {
                    //tinymce.get('mail_body').isNotDirty = 0;
                    $("#save_status").html("Not saved");
                },
                error: function() {
                    alert('File is not deleted');
                }
            });
            //alert(sb.children(".filename").children("input").val());
            $("#attach_size").attr("sizev", (parseInt($("#attach_size").attr("sizev")) - parseInt(sb.attr("sizev"))));
            // sb.remove();
            // ts.setTotalSize();
            // alert($(this).attr("class"));
        });
    }
    this.setAbort = function(jqxhr)
    {
        var sb = this.statusbar;
        var ts = this;
        this.abort.click(function()
        {
            $(sb).tooltip('hide');
            jqxhr.abort();
            if (sb.children(".AttprogressBar").children("div").html() == "100%") {
                $.ajax({
                    type: "POST",
                    url: "index.php?ajxurl=" + url,
                    data: "fname=" + sb.children(".filename").children("input").val(),
                    //dataType: "json",
                    success: function(data) {
                        var obj = JSON.parse(data);
                        if (obj['error'] != "") {
                            msg(obj['error'], "R");
                        } else {
                            $("#save_status").html("Not saved");
                            sb.remove();
                            ts.setTotalSize();
                        }
                        // tinymce.get('mail_body').isNotDirty = 0;
                    },
                    error: function() {
                        alert('File is not deleted');
                    }
                });
                $("#attach_size").attr("sizev", (parseInt($("#attach_size").attr("sizev")) - parseInt(sb.attr("sizev"))));
            }
            else {
                sb.remove();
            }
        });
    }
    this.appendFN = function(fn)
    {
        this.filename.append("<input type=\"hidden\"  name=\"ticket_attach[]\"  value=\"" + fn + "\"   />");
    }
    this.errorMsg = function()
    {
        var sb = this.statusbar;
        sb.children(".AttprogressBar").children("div").html("File Error");
        sb.children(".AttprogressBar").show();
        sb.children(".filename").children("input").remove()
    }
}

function insert_attach(input, url) {
    var files = input.files;
    $.each(files, function(idx, file) {
        var fd = new FormData();
        fd.append('ticket_attach', file);
        var obj = $(".attList");
        var status = new createStatusbar(obj, url); //Using this we can set progress.
        // var status="";
        status.setFileNameSize(file.name, file.size);
        sendFileToServer(fd, status, file, url);
    });
    $(files).val("");
}
