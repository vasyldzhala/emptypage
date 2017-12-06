
function ajaxRequest(method, url) {
  return new Promise( (resolve, reject) => {
    var req = new XMLHttpRequest();
    req.open(method, url, true);
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
    req.send();
  });
}

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

function onDataLoad(albums, images) { // *******************************

let selectAlbums = document.getElementById("select-albums");
let selectAlbumsInnerCode = `
<li>
<input type="checkbox" name="selectAllAlbums" value="selectAllAlbums" checked="checked"> Select All (${images.length})
</li><hr>`;
for (let i = 0, lng = albums.length; i < lng; i++) {
	selectAlbumsInnerCode += `
<li><input type="checkbox" name="albums" value="${albums[i].id}" checked="true"> ${albums[i].title} (${albums[i].numberOfItems}) </li>`;
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
	<img src="${filteredImages[i].URL}" alt="Thumbnail Image"/>`;
	}
	thumbnails.innerHTML = thumbnailsInnerCode;
	
	// sliderInnerCode = `
	// <img src="${filteredImages[0].URL}" id="sliderImage" alt="Slider Image" />`;
	sliderInnerCode = `
	<img src="${filteredImages[0].URL}" class="sliderImage" alt="Slider Image" />`;
	slider.innerHTML = sliderInnerCode;
	// sliderFullScreen.innerHTML = sliderInnerCode;

	let sliderImage = document.getElementsByClassName("sliderImage");
	console.log(`sliderImage0 ${sliderImage[0].src}`);
//	console.log(`sliderImage1 ${sliderImage[1].src}`);

	let imagesThumbnails = thumbnails.getElementsByTagName("img");

	let slideImage = (...ind) => {
	console.log(`sliderImage0 ${sliderImage[0].src}`);
//	console.log(`sliderImage1 ${sliderImage[1].src}`);		
		if (ind[0]) imageIndex = ind[0];
		let hide = () => {
console.log(`hide sliderImage0 ${sliderImage[0].src}`);
//console.log(`hide sliderImage1 ${sliderImage[1].src}`);		

			// for (let slIm of sliderImage) slIm.setAttribute("class","sliderImageHide");
sliderImage[0].setAttribute("class","sliderImageHide");
//sliderImage[1].setAttribute("class","sliderImageHide");

			for (let image of imagesThumbnails) image.setAttribute("class", "thumbnails");
		}

		let show = () => {
			for (let slIm of sliderImage) {
				slIm.setAttribute("src",filteredImages[imageIndex].URL);
				slIm.setAttribute("title",`Album: album`);
				slIm.setAttribute("class","sliderImageShow");
							
			}
	console.log(`sliderImage ${sliderImage[0].src}`);
//	console.log(`sliderImage ${sliderImage[1].src}`);						
			imagesThumbnails[imageIndex].scrollIntoView(true);
			imagesThumbnails[imageIndex].setAttribute("class", "thumbnails-cursor");
			imageIndex++;
			if (imageIndex >= filteredImages.length) {
				imageIndex = 0;
			}						
		}


		hide();
		let delay = setTimeout(show, transformTime);
	}

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
	}

	sliderImage[0].onclick =  () => {
		if (runSlider) {
			clearInterval(runSlider);
			slideImage();
			runSlider = setInterval(slideImage, sliderInterval);		
		} else {
			slideImage();
		}

	}	

	for (let j = 0, lng = imagesThumbnails.length; j < lng; j++) {
		imagesThumbnails[j].onclick = () => {
			if (runSlider) {
				clearInterval(runSlider);
				slideImage(j);
				runSlider = setInterval(slideImage, sliderInterval);			
			} else {
				slideImage(j);
			}
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



};
