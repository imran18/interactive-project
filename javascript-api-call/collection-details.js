Date.prototype.toShortFormat = function() {
    let monthNames =["Jan","Feb","Mar","Apr",
                    "May","Jun","Jul","Aug",
                    "Sep", "Oct","Nov","Dec"];
    let day = this.getDate();
    let monthIndex = this.getMonth();
    let monthName = monthNames[monthIndex];
    let year = this.getFullYear();
    return `${day}-${monthName}-${year}`;  
    }
    let url_string = window.location.href; //window.location.href
    let url = new URL(url_string);
    let id = url.searchParams.get("id");
    $(()=>{
        $.ajax({
            url:'https://api.vic.gov.au:443/museumvictoria/v1.0/collections/articles',
            method:'GET',
            beforeSend:(xhr)=>{
                xhr.setRequestHeader('apikey','163ed491-51f4-4d8b-b531-547584af3cd4');
            },
            success:(data)=>{
                $('#loader').css('display','none');
                $('#content-para').html(data[id].content);
                $(function(){
                $("#content-para").readMore({
                    lines: 3,
                    readMoreLabel:"Read More",
                    readLessLabel:"Read Less",
                    ellipsis: "",
                })
                });
                $('#title').append(data[id].title);
                $('#author').append(data[id].authors[0].fullName);
                $('#image').attr('src',data[id].media[0].large.uri);
                let str="";
                data[id].keywords.forEach(element => {
                    str = str+element+", ";
                });
                $('#keywords').append(str);
                let date = new Date(data[id].dateModified);
                date = date.toShortFormat(date)
                $('#date').append(date);
                $('#year').append(data[id].yearWritten);
                $('#collections').removeClass('d-none');   
            }
        })
    })