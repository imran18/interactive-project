let recordsData;
const loadData = () =>{
let xhr = new XMLHttpRequest();  // fetching records from the api in javascript here
xhr.open("GET" , "https://api.vic.gov.au:443/museumvictoria/v1.0/collections/articles");
xhr.setRequestHeader('apikey','163ed491-51f4-4d8b-b531-547584af3cd4'); // using the api key



// Getting records one by one and displaying in html

xhr.onload = async function(){
    if(xhr.readyState == 4 && xhr.status == 200 ){
            let data= await JSON.parse(xhr.responseText);
            recordsData = data;
            document.getElementById('loader').style.display='None';
            data.forEach((element,i) => {
                if(element.media.length === 0){
                    // do nothing
                }else{
                    let colDiv=document.createElement("div");
                    colDiv.classList.add("col-md-6","mb-5");
                    let cardDiv=document.createElement("div");
                    cardDiv.classList.add("card");
                    let cardImage = document.createElement('img');
                    cardImage.setAttribute("src",element.media[0].large.uri);
                    cardImage.classList.add("card-img-top");
                    let anchor=document.createElement("a");
                    anchor.setAttribute("href",`./collection-details.html?id=${i}`);
                    anchor.setAttribute("style","text-decoration: none !important;");
                    anchor.appendChild(cardImage);
                    let cardBody=document.createElement("div");
                    cardBody.classList.add("card-body");
                    let anchor2=document.createElement("a");
                    anchor2.setAttribute("href",`./collection-details.html?id=${i}`);
                    let title = document.createTextNode(element.title)
                    let h4=document.createElement("h4");
                    h4.appendChild(title)
                    h4.classList.add("card-title");
                    anchor2.appendChild(h4);
                    cardBody.appendChild(anchor2);
                    cardDiv.appendChild(anchor);
                    cardDiv.appendChild(cardBody);
                    colDiv.appendChild(cardDiv);
                    document.getElementById('list').appendChild(colDiv);
                }
            });
        }        
    }
xhr.send()
}


const searchFunction= ()=>{
    let searchTxt = document.getElementById('search-input').value;
    document.getElementById('list').innerHTML = "";
    recordsData.forEach((element,i) => {
                let searchString = element.title.toLowerCase();
                searchTxt = searchTxt.toLowerCase(); 
                let result = searchString.search(searchTxt);
                
                if(element.media.length === 0 || result < 0){
                    // do nothing
                }else{

                    let colDiv=document.createElement("div");
                    colDiv.classList.add("col-md-6","mb-5");
                    let cardDiv=document.createElement("div");
                    cardDiv.classList.add("card");
                    let cardImage = document.createElement('img');
                    cardImage.setAttribute("src",element.media[0].large.uri);
                    cardImage.classList.add("card-img-top");
                    let anchor=document.createElement("a");
                    anchor.setAttribute("href",`./collection-details.html?id=${i}`);
                    anchor.setAttribute("style","text-decoration: none !important;");
                    anchor.appendChild(cardImage);
                    let cardBody=document.createElement("div");
                    cardBody.classList.add("card-body");
                    let anchor2=document.createElement("a");
                    anchor2.setAttribute("href",`./collection-details.html?id=${i}`);
                    let title = document.createTextNode(element.title)
                    let h4=document.createElement("h4");
                    h4.appendChild(title)
                    h4.classList.add("card-title");
                    anchor2.appendChild(h4);
                    cardBody.appendChild(anchor2);
                    cardDiv.appendChild(anchor);
                    cardDiv.appendChild(cardBody);
                    colDiv.appendChild(cardDiv);
                    document.getElementById('list').appendChild(colDiv);
                }
            });
    
}

const reloadFunction= ()=>{
    window.location.reload();
}

const loadDetails = () =>{

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
                    data[id].keywords.forEach((element,i) => {
                        if(data[id].keywords.length == i+1){
                            str = str+element;
                        }else{
                            str = str+element+", ";
                        }
                        
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


}