# indonesia-logo

This repository contains the logos of provinces and districts in Indonesia. You can access it at **_https://jastinxyz.github.io/indonesia-logo/images/{code}.{ext}_**. You can make a request to [data/output.json](https://jastinxyz.github.io/indonesia-logo/data/output.json) to get the code and image paths from all provinces and districts as an array. *Province and city codes are based on the [laravolt/indonesia](https://github.com/laravolt/indonesia) package.*

And is it also an alternative to [laravolt/indonesia-logo](https://github.com/laravolt/indonesia-logo) which seems to have been abandoned 8 years ago?

In this repo there is also a crawler with nodejs that you can use if you want. How does the crawler work? It will take data on which [districts](https://github.com/JastinXyz/indonesia-logo/blob/main/data/cities.json) and [provinces](https://github.com/JastinXyz/indonesia-logo/blob/main/data/provinces.json) will be scraped, then will make a request to Wikipedia and take all province and district logos with the highest resolution (if any).