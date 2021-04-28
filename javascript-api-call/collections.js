let xhr = new XMLHttpRequest();  // fetching records from the api in javascript here
xhr.open("GET" , "https://api.vic.gov.au:443/museumvictoria/v1.0/collections/articles");
xhr.setRequestHeader('apikey','163ed491-51f4-4d8b-b531-547584af3cd4'); // using the api key

let recordsData;

// Getting records one by one and displaying in html

xhr.onload = async function(){
    if(xhr.readyState == 4 && xhr.status == 200 ){
            let data= await JSON.parse(xhr.responseText);
            console.log(data);
            recordsData = data;
            document.getElementById('loader').style.display='None';
            data.forEach((element,i) => {
                if(element.media.length === 0){
                    // do nothing
                }else{
            
                    let div=document.createElement("div");
                    div.setAttribute("class","object");
                    let span=document.createElement("span");
                    span.classList.add('fa','fa-tag')
                    span.setAttribute("style","margin-right: 10px;");
                    let h4=document.createElement("h4");
                    h4.appendChild(span);
                    h4.append(element.title);
                    let anchor=document.createElement("a");
                    anchor.setAttribute("href",`./collection-details.html?id=${i}`);
                    anchor.setAttribute("style","text-decoration: none !important;");
                    anchor.appendChild(h4);
                    h4.setAttribute("style","margin-bottom: 40px;");
                    let br=document.createElement("br");
                    let anchor2=document.createElement("a");
                    // anchor2.setAttribute("href",`./collection-details.html?id=${i}`);
                    // anchor2.setAttribute("style","text-decoration: none !important;");
                    let image = document.createElement('img');
                    image.setAttribute("src",element.media[0].large.uri);
                    image.setAttribute("style","margin-bottom: 50px;");
                    // anchor2.appendChild(image)
                    div.appendChild(anchor);
                    div.appendChild(br);
                    div.appendChild(image);
                    div.appendChild(br);
                    div.appendChild(br);
                    div.appendChild(br);
                    div.appendChild(br);
                    document.getElementById('list_of_collections').appendChild(div);
                }
            });
        }        
    }

xhr.send()


const searchFunction= ()=>{
    let searchTxt = document.getElementById('search-input').value;
    document.getElementById('list_of_collections').innerHTML = "";
    recordsData.forEach((element,i) => {
                let searchString = element.title.toLowerCase();
                searchTxt = searchTxt.toLowerCase(); 
                let result = searchString.search(searchTxt);
                
                if(element.media.length === 0 || result < 0){
                    // do nothing
                }else{
                    let div=document.createElement("div");
                    div.setAttribute("class","object");
                    let span=document.createElement("span");
                    span.classList.add('fa','fa-tag')
                    span.setAttribute("style","margin-right: 10px;");
                    let h4=document.createElement("h4");
                    h4.appendChild(span);
                    h4.append(element.title);
                    let anchor=document.createElement("a");
                    anchor.setAttribute("href",`./collection-details.html?id=${i}`);
                    anchor.setAttribute("style","text-decoration: none !important;");
                    anchor.appendChild(h4);
                    h4.setAttribute("style","margin-bottom: 40px;");
                    let br=document.createElement("br");
                    let anchor2=document.createElement("a");
                    // anchor2.setAttribute("href",`./collection-details.html?id=${i}`);
                    // anchor2.setAttribute("style","text-decoration: none !important;");
                    let image = document.createElement('img');
                    image.setAttribute("src",element.media[0].large.uri);
                    image.setAttribute("style","margin-bottom: 50px;");
                    // anchor2.appendChild(image)
                    div.appendChild(anchor);
                    div.appendChild(br);
                    div.appendChild(image);
                    div.appendChild(br);
                    div.appendChild(br);
                    div.appendChild(br);
                    div.appendChild(br);
                    document.getElementById('list_of_collections').appendChild(div);
                }
            });
    
}

const reloadFunction= ()=>{
    window.location.reload();
}