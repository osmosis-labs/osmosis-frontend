도커파일에서 ADD를 사용해서 레포의 파일들을 이동시킨다.  
하지만 ADD는 현재의 컨텍스트를 벗어날 수 없기 때문에 build에서 컨텍스트를 바꿔서 실행해야한다.

```shell
docker build -t osmosis-frontend -f ./Dockerfile ..
```
