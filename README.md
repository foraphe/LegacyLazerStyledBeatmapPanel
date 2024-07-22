A old lazer styled osu! beatmap info panel to use with [gosumemory](https://github.com/l3lackShark/gosumemory). 

### Usage

Add the folder to `static` folder in gosumemory directory, then refer to [gosumemory](https://github.com/l3lackShark/gosumemory)'s README for usage.
**Currently supports STD only**.

If an API v1 key is provided via URL parameters (see below), the panel will try to look up for some information (drain time, online SR, etc.) from osu! API. If not, these values will be calculated locally using the beatmap's `.osu` file. The local calculation of Online SR is implemented using a wasm version of [rosu-pp](https://github.com/MaxOhn/rosu-pp) (see [this fork](https://github.com/foraphe/rosu-pp-wasm)).

### URL Parameters

| Name     |   Value    | Default | Note                                                           |
| -------- | ---------- | --------|--------------------------------------------------------------- |
| bgSwitch | 0 or 1     | 1       | Whether to show fullscreen BG of current beatmap               |
| bgDim    | range[0,1] | 0.25    | Darkening of the background                                    |
| expanded | 0 or 1     | 1       | Whether to show detailed information about the current beatmap |
| apikey   | String     | ''      | osu! API v1 API key for extra information on the panel         |

### TODO

- [ ] Support for other modes
- [x] Provider to read .osu file through gosumemory's built-in web server for when certain features don't work in certain modes (e.g. length/bpm don't work in mania)
- [ ] Pure JS implementation of online SR calculation

### Disclaimer

This project is still in its early stage and may contain bugs or unexpected behavior. Feel free to report them if you encounter any.
