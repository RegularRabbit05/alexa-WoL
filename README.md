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