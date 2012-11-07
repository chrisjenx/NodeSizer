#*_WORK IN PROGRESS_*
#NodeSizer 
## Caching ImageResizingProxy service running in node js.

Server designed to provide a nice way of requesting images on the internet at a size you want. Designed and built in Node JS.
It's none blocking, so rolled on out on a CDN/Cloud will scale uniformly.

### Currently supports

* `source=` the source file anywhere on the internet. (WebAddress)
* `size=` single or widthxheight e.g. '240' (finds the largest side) '240x360' will do it exact.

An example request looks like `http://localhost:8080/convert?size=240&source=http://yoursite.com/media/yourimage.png`

### Coming soon
* Returns requested image (yeah i know ran out of time tonight)
* Caching images (only creates images at the moment).