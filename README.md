# Self Hosted Alexa Wake On Lan
Host this repository on something like [Vercel](https://vercel.com)

Required ENV variables:
- **AVAILABLETEXT** -> "available devices:"
- **NOTFOUNDTEXT** -> "Could not find a device named"
- **POWERTEXT** -> "Powering on"
- **HELPTEXT** -> "Specify a computer to power-on"
- **SMARTTOKEN** -> Auth token for your WoL receiver
- **SMARTENDPOINT** -> Endpoint of public - facing WoL receiver (Suggest using cloudflare tunnels)
- **TOKEN** -> Auth token that you will give to your alexa skill

## Alexa setup:
Create a skill and select "host your own endpoint" <br>
Go to endpoints and set your vercel endpoint such as `https://domain.com/api/<TOKEN>/handle` <br>
Then setup your call words and skill name<br><br>
<img width="842" height="696" alt="image" src="https://github.com/user-attachments/assets/8e2b9783-d314-4191-add7-85b13f1d9890" />

## WoL receiver:
I have my home system but you can easily make a single receiver running on some arduino or similar. <br>
To work with this system it must expose 2 endpoints: <br>
- 1: `https://domain.com/api/discover?deadline=1000` <br>
Sample response:
```json
{
    "status": 200,
    "payload": [
        {
            "name": "wol",
            "version": 1,
            "type": 1,
            "friendly": "Wake Computers",
            "configuration": [
                {
                    "mac": "00:00:00:00:00:00",
                    "name": "PC-1"
                },
                {
                    "mac": "00:00:00:00:00:00",
                    "name": "PC-2"
                }
            ]
        }
    ]
}
```
- 2: `https://domain.com/api/dev/wol/send` <br>
Sample POST **request**:
```json
{ "mac" : "00:00:00:00:00:00" }
```
