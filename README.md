# shopsterfied
Let's go Shopping!

To get started in development.

Install Docker.
([Mac](https://docs.docker.com/mac/)/[Windows](https://docs.docker.com/windows/))

Run docker in (Mac/Linux):

```sh
$ docker build -t shopsterfied .
$ docker run -p 8080:80 -d -v $(pwd)/site:/var/www/site shopsterfied
```

If you want to debug issues with your container (Mac/Linux):

```sh
$ docker run -i -t -p 8080:80 shopsterfied /bin/bash
$ apacherctl start
```
