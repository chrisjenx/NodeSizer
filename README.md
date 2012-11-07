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


##Licence
>   Copyright 2012 Christopher Jenkins
>
>  Licensed under the Apache License, Version 2.0 (the "License");
>  you may not use this file except in compliance with the License.
>  You may obtain a copy of the License at
>
>   http://www.apache.org/licenses/LICENSE-2.0
>
>  Unless required by applicable law or agreed to in writing, software
>  distributed under the License is distributed on an "AS IS" BASIS,
>  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
>  See the License for the specific language governing permissions and
>  limitations under the License.