
// variables
var photoResults = new Map(); //photo results
var selectedPhotos = new Map(); // selected images that are saved for gallery
var isViewingGallery = false; // if currently in viewing gallery "mode"

// flickr search options
var options = { 
	"api_key": "dd97fe1f49ec23d84b8c0be209d64137",
	"method": "flickr.photos.search", 
	"sort" : "relevance",
	//"per_page": 10,
	"format": "json",
	"nojsoncallback": "1",
	"text": "flickr"
}

// show selected photos as gallery
var showGallery = function() {
	isViewingGallery = true;
	showPhotos(selectedPhotos);
};

// make a request to the flickr REST API
var makeFlickrRequest = function(options, cb) {
	var url, xhr, item, first;

	url = "https://api.flickr.com/services/rest/";
	first = true;

	for (item in options) {
		if (options.hasOwnProperty(item)) {
			url += (first ? "?" : "&") + item + "=" + options[item];
			first = false;
		}
	}

	xhr = new XMLHttpRequest();
	xhr.onload = function() { cb(this.response); };
	xhr.open('get', url, true);
	xhr.send();

};

// search flickr with free text @searchText
var searchFlickr = function(searchText) {
	isViewingGallery = false;
	options['text'] = searchText;
	makeFlickrRequest(options, function(data) {
		let results = JSON.parse(data);
		//photoResults = results.photos.photo;
		photoResults = new Map(results.photos.photo.map((i) => [i.id, i])); // convert to hash map

		showPhotos(photoResults);

	});
	return false;
};

// show photos from a given JSON object with flickr photo data
var showPhotos = function(photosJSON) {
	var container = document.getElementById("img-container");

	// empty image container
	while (container.firstChild) {
		container.removeChild(container.firstChild);
	}

	// append photo results
	photosJSON.forEach(function(photo) {
		try {
			var img = createImg(photo.farm, photo.server, photo.id, photo.secret, photo.title);
			container.appendChild(img);
		} catch(err) {
			console.log(err.message);
		}
	});

};

// creates and returns an image DOM from flickr variables
var createImg = function(farm_id, server_id, id, secret, title) {

	// img block (parent DOM)
	var imgBlock = document.createElement("div");
	imgBlock.classList.add("img-block");
	imgBlock.setAttribute("id", id);

	imgBlock.addEventListener("click", imgClick, false);


	// flickr size suffix (q=large square 150x150) (n=small, 320 on longest side)
	var imgSize = (isViewingGallery) ? 'q' : 'n';


	// image DOM
	var src_url = "https://farm"+farm_id+".staticflickr.com/"+server_id+"/"+id+"_"+secret+"_"+imgSize+".jpg";
	var img_DOM = document.createElement("img");
	img_DOM.setAttribute("src", src_url);
	img_DOM.setAttribute("alt", title);
	img_DOM.setAttribute("title", title);
	imgBlock.appendChild(img_DOM);

	// visualize if selected
	if (!isViewingGallery && selectedPhotos.has(id)) {
		imgBlock.classList.add('selected');
	}

	// image title DOM
	var imgBlockTitle = document.createElement("div");
	imgBlockTitle.classList.add("img-block-title");

	var title_text = document.createTextNode(title);
	imgBlockTitle.appendChild(title_text);
	imgBlock.appendChild(imgBlockTitle);

	return imgBlock;
};

// image click
var imgClick = function(element) {
	if(isViewingGallery) {
		zoomImg(element);
	} else {
		toggleSelect(element);
	}
};

// toggle image selection
var toggleSelect = function(element) {
	var selectedImgBlock = element.target.parentElement;
	var imgID = selectedImgBlock.id;


	// check if it exists in array
	if (selectedPhotos.has(imgID)) {
		selectedPhotos.delete(imgID);
		selectedImgBlock.classList.remove('selected');
	} else {
		selectedPhotos.set(imgID,photoResults.get(imgID));
		selectedImgBlock.classList.add('selected');
	}
	
};

// present image in full size as a modal
var zoomImg = function(element) {
	var modal = document.getElementById('imgModal');
	var modalImg = document.getElementById("displayImg");
	var modalCaption = document.getElementById("caption");

	modal.style.display = "block";
	var selectedImgBlock = element.target.parentElement;
	var selectedImg = selectedPhotos.get(selectedImgBlock.id);

	var img_url = "https://farm"+selectedImg.farm+".staticflickr.com/"+selectedImg.server+"/"+selectedImg.id+"_"+selectedImg.secret+".jpg";
	modalImg.src = img_url;
	modalCaption.innerHTML = element.target.title;
};

