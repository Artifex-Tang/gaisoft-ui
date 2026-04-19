let fileIcon={};

let loadFileIcon=(ext)=>{
    switch(ext){
        case 'docx':
            return '/imgs/fileIcon/word.png';
        case 'doc':
           return '/imgs/fileIcon/word.png';
        case 'pdf':
            return '/imgs/fileIcon/pdf.png';
        case 'pptx':
            return '/imgs/fileIcon/ppt.png';
        case 'ppt':
           return '/imgs/fileIcon/ppt.png';
        case 'xlsx':
            return '/imgs/fileIcon/xls.png';
        case 'xls':
             return '/imgs/fileIcon/xls.png';
        case "txt":
             return '/imgs/fileIcon/txt.png';
        case 'zip':
            return '/imgs/fileIcon/zip.png';
        default:
            return '/imgs/fileIcon/other.png';
    }
}

export default loadFileIcon;