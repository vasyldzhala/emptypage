function ajaxRequest(method, url, sendData = null) {
  return new Promise( (resolve, reject) => {
    var req = new XMLHttpRequest();
    if ((method=='GET') && !(sendData==null)) {
     	url = url + '?jsonData=' + JSON.stringify(sendData);
    }
    console.log(`ajaxRequest, method=${method}, url=${url}`);
    req.open(method, url, true); 
    //req.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    //req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    req.addEventListener('load', () => {
		if (req.status == 200) {
			resolve(req.response);
		} else {
			var error = new Error(req.statusText);
			error.code = req.status;
			reject(error);
	      }
    }, false);
    req.addEventListener('error', () => {
    	reject(new Error("Network Error"));
    }, false);
    if ((method=='POST') && !(sendData==null))  {
    	req.send('jsonData=' + JSON.stringify(sendData));  
    	console.log(`sendData = ${'jsonData=' + JSON.stringify(sendData)}`);	
    } else {
		req.send();
    }
  });
}

function loadGallery() {
	Promise.all([
		ajaxRequest('GET','db/readalbums.php'), 
		ajaxRequest('GET','db/readimages.php')
	])
	.then(
		respValue => {
			let [albums, images] = respValue;
			console.log(`Request is fulfilled: readalbums.php`);
			console.log(`Request is fulfilled: readimages.php`);
			albums = JSON.parse(albums);
			images = JSON.parse(images);
			onDataLoad(albums, images);
		},
		reason => {
			console.log(`Rejected: ${reason}`);
		}
	);
}

loadGallery();


function onDataLoad(albums, images) { // *******************************

let selectAlbums = document.getElementById("select-albums");
let selectAlbumsInnerCode = `
<li>
<label>
<input type="checkbox" name="selectAllAlbums" value="selectAllAlbums" checked="checked">
 Select All (${images.length})
</label>
</li><hr>`;
for (let i = 0, lng = albums.length; i < lng; i++) {
	selectAlbumsInnerCode += `
<li>
<label>
<input type="checkbox" name="albums" value="${albums[i].id}" checked="true">
 ${albums[i].title} (${albums[i].numberOfItems})
</label> 
</li>`;
}
selectAlbums.innerHTML = selectAlbumsInnerCode;

let filteredImages = images;

let imageIndex = 0;
let sliderInterval = 3000;
let transformTime = 500;
let runSlider = false;

let thumbnails = document.getElementById("gallery-thumbnails");
let thumbnailsInnerCode = ``;
let slider = document.getElementById("slider");
let sliderFullScreen = document.getElementById("slider-full-screen");
let sliderInnerCode = ``;

function buildSliderTemplate() {
	if (runSlider) {
		clearInterval(runSlider);
		runSlider = false;
	}
	imageIndex = 0;
	thumbnailsInnerCode = ``;
	for (let i = 0, lng = filteredImages.length; i < lng; i++) {
		thumbnailsInnerCode += `
	<img src="${filteredImages[i].URL}" class= "thumbnails" onload="this.style.opacity='1'" image-index="${i}" alt="Thumbnail Image"/>`;
	}
	thumbnails.innerHTML = thumbnailsInnerCode;
	
	sliderInnerCode = `
	<img src="${filteredImages[0].URL}" id="sliderImage" class="sliderImageShow" alt="Slider Image" />`;
	slider.innerHTML = sliderInnerCode;

	sliderInnerCode = `
	<img src="${filteredImages[0].URL}" id="sliderImageFullScreen" class="sliderImageShow" alt="Slider Image" />`;
	sliderFullScreen.innerHTML = sliderInnerCode;

	let sliderImage = document.getElementById("sliderImage");
	let sliderImageFullScreen = document.getElementById("sliderImageFullScreen");

	let imagesThumbnails = thumbnails.getElementsByTagName("img");

	let slideImage = (...ind) => {
		let hide = () => {
			sliderImage.classList.add("sliderImageHide");
			sliderImageFullScreen.classList.add("sliderImageHide");
			imagesThumbnails[imageIndex].classList.remove("thumbnails-cursor");
		}

		let setImageSize = (image, margins) => {
			let margins2 = margins*2;
			let windowWidth = document.documentElement.clientWidth - margins2, 
				windowHeight = document.documentElement.clientHeight - margins2,
				imageWidth = image.naturalWidth,
				imageHeight = image.naturalHeight;
			let imageSizeRatio;
			(imageWidth/imageHeight < windowWidth/windowHeight) ? 
				imageSizeRatio = windowHeight/imageHeight : 
				imageSizeRatio = windowWidth/imageWidth;
			image.style.with = `${imageWidth * imageSizeRatio}px`;
			image.style.height = `${imageHeight * imageSizeRatio}px`;
		}

		let show = () => {
			sliderImage.classList.remove("sliderImageHide");
			imagesThumbnails[imageIndex].scrollIntoView(true);
			imagesThumbnails[imageIndex].classList.add("thumbnails-cursor");
			sliderImageFullScreen.classList.remove("sliderImageHide");		
		}

		let changeImage = () => {
			if (Number.isInteger(ind[0])) {
				imageIndex = ind[0];
			} else {
				imageIndex++;
				if (imageIndex >= filteredImages.length) {
					imageIndex = 0;
				}					
			}
			sliderImage.src = filteredImages[imageIndex].URL;
			sliderImageFullScreen.src = filteredImages[imageIndex].URL;
			sliderImageFullScreen.onload = () => {
				setImageSize(sliderImageFullScreen, 60);
				show();
			}	
		}


		hide();
		let delay = setTimeout(changeImage, transformTime);
	}

	let sliderControls = document.getElementById("slider-controls");
	sliderControls.setAttribute("class", "slider-controls-windowed");
	let sliderButtonPlay = document.getElementById("slider-button-play");
	let sliderButtonPause = document.getElementById("slider-button-pause");
	let sliderButtonFullScreen = document.getElementById("slider-button-full-screen");
	let sliderButtonWindowed = document.getElementById("slider-button-windowed");	
	sliderButtonPlay.disabled = false;
	sliderButtonPause.disabled = true;
	sliderButtonFullScreen.disabled = false;
	sliderButtonWindowed.disabled = true;

	sliderButtonPlay.onclick = () => {
		if (!runSlider) {
			runSlider = setInterval(slideImage, sliderInterval);
			sliderButtonPlay.disabled = true;
			sliderButtonPause.disabled = false;
		} 
	}
	sliderButtonPause.onclick = () => {
		if (runSlider) {
			clearInterval(runSlider);
			sliderButtonPlay.disabled = false;
			sliderButtonPause.disabled = true;
			runSlider = false;
		} 
	}

	sliderButtonFullScreen.onclick = () => {
		sliderFullScreen.style.display = "flex";
		sliderControls.setAttribute("class", "slider-controls-full-screen");
		sliderButtonFullScreen.disabled = true;
		sliderButtonWindowed.disabled = false;
	}

	sliderButtonWindowed.onclick = () => {
		sliderFullScreen.style.display = "none";
		sliderControls.setAttribute("class", "slider-controls-windowed");
		sliderButtonFullScreen.disabled = false;
		sliderButtonWindowed.disabled = true;
	}


	sliderImage.onclick =  () => {
		if (runSlider) {
			clearInterval(runSlider);
			slideImage();
			runSlider = setInterval(slideImage, sliderInterval);		
		} else {
			slideImage();
		}

	}	

	sliderImageFullScreen.onclick =  () => {
		if (runSlider) {
			clearInterval(runSlider);
			slideImage();
			runSlider = setInterval(slideImage, sliderInterval);		
		} else {
			slideImage();
		}

	}

	thumbnails.onclick = (event) => {
		if (!event.target.hasAttribute('image-index')) return;
		let imgInd = event.target.getAttribute('image-index');
		if (runSlider) {
			clearInterval(runSlider);
			slideImage(+imgInd);
			runSlider = setInterval(slideImage, sliderInterval);			
		} else {
			slideImage(+imgInd);
		}		
	}
}

buildSliderTemplate();

let selectAlbumsListItems = selectAlbums.getElementsByTagName("input");
let showSelectedButton = document.getElementById("show-selected-albums");

selectAlbumsListItems[0].onchange = () => {
	if (selectAlbumsListItems[0].checked) {
		for (let i = 1, lng = selectAlbumsListItems.length; i < lng; i++) {
			selectAlbumsListItems[i].checked = true;
		}
	}
}
for (let i = 1, lng = selectAlbumsListItems.length; i < lng; i++) {
	selectAlbumsListItems[i].onchange = () => {
		if (!selectAlbumsListItems[i].checked) selectAlbumsListItems[0].checked = false;
	}
}

showSelectedButton.onclick = () => {
	if (!selectAlbumsListItems[0].checked) {
		filteredImages = [];
		for (let i = 0, lng = images.length; i < lng; i++) {
			let searchIndex = -1,
				searchID = images[i].albumID;
			for (let j = 0, lng1 = albums.length; j < lng1; j++) {
				if (albums[j].id === searchID) {
					searchIndex = j; 
					break;
				}
			}
			if (searchIndex < 0 || selectAlbumsListItems[searchIndex+1].checked) {
				filteredImages.push(images[i]);
			}
		}
	} else {
		filteredImages = images;
	}

	buildSliderTemplate();

}

let addImagesFormShowButton = document.getElementById("add-images-form-show-button");
let loadImagesFormDiv = document.getElementById("load-images-form");
let addImForm = document.forms.addImagesForm;
addImagesFormShowButton.onclick = () => {
	if (!isNaN(parseFloat(localStorage.userId)) && isFinite(localStorage.userId)) {
		if (runSlider) {
			clearInterval(runSlider);
			runSlider = false;
		}
		loadImagesFormDiv.style.display = "block";
	} else {
		alert('You must be currently logged to add images');
	}
}

let loadImagesSelectAlbum = document.getElementById("load-images-select-album");
let liSelectAlbumInnerCode = ``;
for (let alb of albums) {
	liSelectAlbumInnerCode += `<option value="${alb.id}">${alb.title}</option>`;
}

loadImagesSelectAlbum.innerHTML = liSelectAlbumInnerCode;

let loadImagesFormImageURL = document.getElementById("load-images-form-imageURL");
let addImagesThumbnails = document.getElementById("add-images-thumbnails");
loadImagesFormImageURL.onchange = () => {
	let imgs = document.forms.addImagesForm.imageURL.value.split(',');
	let imThCode=``;
	for (img of imgs) {
		imThCode += `<img src="${img.trim()}" alt="${img.trim()}"/>`;
	}
	addImagesThumbnails.innerHTML = imThCode;

}

let canselAddImagesButton = document.getElementById("cansel-add-images-button");
canselAddImagesButton.onclick = () => {
	addImagesThumbnails.innerHTML = ``;
	loadImagesFormDiv.style.display = "none";
}

let addImagesButton = document.getElementById("add-images-button");
addImagesButton.onclick = () => {
	let sendData = {
		URL: document.forms.addImagesForm.imageURL.value,
		albumID: document.forms.addImagesForm.albums.value,
		userID: localStorage.userId,
		title: encodeURIComponent(document.forms.addImagesForm.title.value),
		description: encodeURIComponent(document.forms.addImagesForm.description.value)
	};
	addImagesThumbnails.innerHTML = ``;
	loadImagesFormDiv.style.display = "none";

	ajaxRequest('GET','db/addimages.php',sendData)
	.then(
		respValue => {
			console.log(`Request is fulfilled: addimages.php`);
			console.log(`Response = ${respValue}`);
			loadGallery();
		},
		reason => {
			console.log(`Rejected: ${reason}`);
		}
	);
}


};
