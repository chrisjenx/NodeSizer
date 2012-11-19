_WORK IN PROGRESS_
--------------------
NodeSizer 
==========
*Caching ImageResizingProxy service running in node js.*

Server designed to provide a nice way of requesting images on the internet at a size you want. Designed and built in Node JS.
It's none blocking, so rolled on out on a CDN/Cloud will scale uniformly.

Currently supports
------------------

**bold** denotes required.

* **`source=`** the source file anywhere on the internet. (WebAddress)
* **`size=`** single or widthxheight e.g. '240' (finds the largest side) '240x360' will do it exact.
* `ext=` png,jpg,gif,tiff
* `quality=` 1-100 defaults to _80_ only works on jpeg, does a default 7 pass png optimisation.

An example request looks like `http://localhost:8080/convert?size=240&source=http://yoursite.com/media/yourimage.png`

**Headers**

* 1.0.1 - `Content-Creation-Time : [elapsed]` (Returns how long it took to create/return the image for you)


Nodejitsu
---------
Version running on nodejitsu:

`http://nodesizer.jit.su/convert?size=...&source=...`

Please test and let me know if you find any issues.

Coming soon
-----------
* Override file caching
* Image Caching length
* Content expirey headers.
* iPad scaling

Versions
--------
* 1.3.1 <br />
Minor change will clear image/ path on start up.
* 1.3.0 <br />
    * Massive improvement in caching performance! Larger files 300ms to 1ms when cached!
    * Bug fixes.
* 1.2.2 <br />
Floors image sizes to 10 pixel buckets size=237 floors to 230px.
* 1.2.1 <br />
Fixed bug with requesting 0 pixel images. Will now return 400, invalid request.
* 1.2.0 <br />
Added png optipng when converting png's will try and optimise png's.
* 1.1.0 <br /> 
Added `ext=` and `quality=` params. Takes valid image format (png,gif,jpg) and quality between 1 - 100 for jpeg.<br />
If you do not specify an extention will convert to `.png` because png's are not compressed by ISP's over networks.
* 1.0.0 <br />
Basic server caches orginal and created images and will use them downloaded/created


Licence
-------
Copyright 2012 Christopher Jenkins

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.