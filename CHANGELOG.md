# Changelog

All notable changes to this project will be documented below

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added 

- Added some util functions:
    - OUtils.getActor
    - OUtils.listStatusEffectIds
    - OUtils.getStatusEffect
    - OUtils.getDegrees
- Added some extensions to the Actor class:
    - Actor.getToken
    - Actor.getActiveStatusEffect
    - Actor.hasStatusEffect
    - Actor.setStatusEffect
    - Actor.enableStatusEffect
    - Actor.disableStatusEffect
    - Actor.enableStatusEffectFor
    - Actor.getStatusEffectExpiryEvent
    - Actor.timeUntilStatusEffectExpiry
    - Actor.cancelStatusEffectExpiry
- Added some extensions to the DarkHeresyActor class:
    - DarkHeresyActor.hasTalent
- Added some macros
    - FirstAid
    - ToxinCreation
    - ToggleStatusEffect
- Added docs for all of the above

<!--
## [0.0.1] - 2014-08-09

### Added

- Better explanation of the difference between the file ("CHANGELOG")
  and its function "the change log".

### Changed

- Refer to a "change log" instead of a "CHANGELOG" throughout the site
  to differentiate between the file and the purpose of the file — the
  logging of changes.

### Removed

- Remove empty sections from CHANGELOG, they occupy too much space and
  create too much noise in the file. People will have to assume that the
  missing sections were intentionally left out because they contained no
  notable changes.
-->

[unreleased]: https://github.com/Akeboshiwind/olivers-dh2-extras/compare/0.0.1...HEAD
<!-- [0.0.2]: https://github.com/Akeboshiwind/olivers-dh2-extras/compare/0.0.1...0.0.2
[0.0.1]: https://github.com/Akeboshiwind/olivers-dh2-extras/releases/tag/0.0.1
-->