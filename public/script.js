
let finalUrl = "";
let drop = document.getElementById('myDrop');
let fileDrop = document.getElementById('file');
let browseBtn = document.getElementById('browseBtn');
let copyUrl =  document.getElementById('fileUrl')
let copyicon =  document.getElementById('copy-icon');

const url = location.origin+'/api/files';

let formSelector =  document.getElementById('e-form');

drop.addEventListener('dragover',(event)=>{
    event.preventDefault();
    console.log("Dropped");

})

const upload = async ()=>{
    const file = fileDrop.files[0];
    const formData =  new FormData();
    formData.append('myFile',file);
    const response = await fetch(url,{
        method:'POST',
        body:formData
    })
    const res =  await response.json();
    copyUrl.value = res.file;
}

copyicon.addEventListener('click',(e)=>{
    let copyText = copyUrl;
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(copyText.value);
})
drop.addEventListener('drop',(event)=>{
    const files = event.dataTransfer.files;
    if(files.length){
        fileDrop.files = files;
        console.log(fileDrop.files[0]);
        upload();
    }
})

fileDrop.addEventListener('change',(event)=>{

    const files = fileDrop.files;
    
    console.log(event);
    if(files.length){
        fileDrop.files = files;
        console.log(fileDrop.files[0]);
        upload();
    }
})
browseBtn.addEventListener('click',(event)=>{
    fileDrop.click();
   
})

formSelector.addEventListener('submit',(e)=>{
    e.preventDefault();
    let uniqueId =  copyUrl.value.split('/').splice(-1,1)[0];
    uniqueId = uniqueId.substring(1);
    console.log(uniqueId);
    const formData = {
        uuid:uniqueId,
        emailTo:formSelector.elements['receiver'].value,
        emailFrom:formSelector.elements['sender'].value
    }
    console.log(formData);
    fetch(`${location.origin}/api/files/send`,{
        method:"POST",
        headers:{
            "Content-Type":"application/json"
        },
        body:JSON.stringify(formData)
    }).then(res => res.json()).then(data=>console.log(data));
})

