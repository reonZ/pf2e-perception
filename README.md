# FoundryVTT PF2e Perception

### This module will add the ability to set conditional covers and visibility between tokens on a scene

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/K3K6M2V13)

Bullet points:

-   the GM can use a new icon (eye) in the token HUD to open the Perception menu for that token, in that menu, you can manually select the conditional covers and visibilities this token has against the other tokens in the scene

-   hovering over a token will display the conditional covers and visibilities other tokens in the scene have gainst this one

-   the module will hide tokens that are conditionally undetected from the GM canvas if one of the selected tokens shouldn't see them or if any owned token in the scene for players

-   the module will hide unnoticed combatants from the combat tracker for players using the same logic as above

-   the module allows players to target conditionally undetected tokens from the combat tracker

-   the module can automatically calculate concealment

-   the module can automatically calculate standard and lesser covers

-   the module automatically applies conditional covers modifiers on attacks

-   the module automatically applies conditional flat-footed modifier on attack when a token is hidden/undetected from another token

-   the module automatically roll a flat-check roll before an attack on a token that is concealed/hidden from the attacker and will cancel the attack when failed

-   the module handles attacking a conditionally undetected token by rolling a blind flat-check and attack roll

-   the module override the `Take Cover` system action, when used with targets, conditional covers will be applied instead of using the system effect

-   the module override the `Hide` system action to be able to apply conditional hidden, the module will automatically roll against the other token's perception DC ; you can target tokens to narrow down which should be affected

-   the module override the `Seek` system action, it will offer the ability to create a template that will automatically be used to target undetected/hidden token and roll against their stealth DC

-   the module add the `Point Out` action, which can be found with the other system actions `game.pf2e.actions.get('point-out')`, if you have a target when using it, the module will modify the target's conditional visibility against the allies of the actor that initiated the action

-   there is a lot of functions exposed in `game.modules.get('pf2e-perception')` that can be used, some even have a debug mode to display the computation like `getCreatureCover`, `hasStandardCover` or `inBrightLight`

# CHANGELOG

You can see the changelog [HERE](./CHANGELOG.md)
