# Walnut Hill Upper Reward Badge Verification

The affected Walnut Hill flyer was opened deterministically with `?property=walnut-hill-apartments` after the upper badge text-box correction.

At desktop scale, the upper-right badge displayed the complete **$200** value with the final zero fully inside the navy field and clear of the right edge. At a 390 px mobile viewport, the fixed letter-size artboard scaled intact and the same badge still displayed all three digits with no clipping.

The correction is protected by the flyer regression suite’s upper-badge amount assertion.
