A old lazer style osu! tourney showcase interface using [gosumemory](https://github.com/l3lackShark/gosumemory). 

# Usage

Add the folder to `static` folder in gosumemory directory. Then refer to [gosumemory](https://github.com/l3lackShark/gosumemory)'s readme for usage.
**Currently supports STD only**.

# URL Parameters

| Name     | Value  | Default | Note                                                       |
| -------- | ------ | --------|----------------------------------------------------------- |
| bgSwitch | 0,1    | 1       | Whether to show fullscreen BG of current beatmap           |
| bgDim    | [0,1]  | 0.25    | Darkening of the background                                |
| expanded | 0,1    | 1       | Whether to show detailed information about current beatmap |
| apikey   | String | ''      | osu! API v1 API key for retrieving online Star Rating      |

# TODO

- [ ] Support for other modes
- [ ] Provider to read .osu file through gosumemory for when certain features doesn't work in certain modes (e.g. length/bpm doesn't work in mania)

# Disclaimer

This project is still in its early stage and may contain bugs or unexpected behaviour. Feel free to report them if you encounter any.
