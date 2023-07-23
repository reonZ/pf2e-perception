todo ?

-   sniping duo ?
-   foil sense ?

# 0.8.0

-   added support for custom rollOptions, those can be added via the system `RollOption` or directly provided in the attack options arguments, here is an example on how to implement the `Blind-Fight` feat, just add those 3 REs in the feat itself:

    ```json
    {"key":"RollOption","domain":"all","option":"self:pf2perception:visibility:cancel:hidden"}
    {"key":"RollOption","domain":"all","option":"self:pf2perception:concealed:dc:0"}
    {"key":"RollOption","domain":"all","option":"self:pf2perception:hidden:dc:5"}
    ```

-   removed automated support for the `Blind-Fight` feat
-   you can now manually override a cover in the modifiers window (the one you need to hold shift to show or not show during a check roll)

# 0.7.2

-   fixed an issue brought by `11.306`

# 0.7.1

-   fixed issue with automated light exposure always considering tokens `hidden` in scenes that had vision/exposure disabled or not in the dark

# 0.7.0

-   replaced `Automate Concealment` setting with `Automate Light Exposure`
-   the system now check if a token is in bright light, dim light or darkness when it comes to automatically checking its visibility state
-   added `Perception Menu Permission` setting which allow you to select which minimum permission a user must have to be able to interact with the perception menu (keep in mind that the menu is a major spoiler if given access to players)
-   added `Conditional Icons` settings menu where you can set custom path to icon images that will be displayed on token hover
-   added `Flat Check` setting allowing you to disabled module flat checks, roll flat checks before attacks or canceling the attacks entirely on failure
-   the `Hide` and `Seek` actions now properly use the degree of success provided by natural 20/1
-   you can now also validate the `Seek` action even without having used a template (you can also manually target)
-   automated creature cover will no longer care for the type of attack (reach, ranged, etc.), it will still require a minimum of 1 square of distance between attacker and target
-   when a player hover over a token, they will not be shown visibility tokens above `concealed` if the other token isn't owned by a player, this prevent players from knowing if they are indeed hidden/undetected from another token
-   fixed validation buttons not showing up on chat message roll cards when using `Dorako UI` module
-   fixed issue with orphan tokens
-   fixed target-less point-out error
-   fixed greater cover giving the wrong bonus value

# 0.6.1

-   fixed a bug during automated concealment check preventing attacks

# 0.6.0

-   non-listed first release
