### Setup

1. Copy file `.env.example` to `.env`
2. Fill in environment variables in `.env`
- go to [Smee.IO](https://smee.io/) to get SMEE source URL
- register and install app [here](https://github.com/settings/apps)
  - client id, app id, installation id, client secret, private key are generated after you are done with this step
3. Create a public repository for your app installation (e.g. https://github.com/adisazhar123/demo-repo )
4. Running it natively

```shell
npm install
npm run start
``` 

5. Running it with Docker

```shell
docker compose up --build
```




### More Info


Follow this [slide](https://docs.google.com/presentation/d/1OmjWxMfqHj2QWYP8FbGcFy_WDMGQZ7yhsZ1iW_ZihCw/edit?usp=sharing).