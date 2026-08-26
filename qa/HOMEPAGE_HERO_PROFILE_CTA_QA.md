# Homepage Hero Profile CTA QA

## Production mobile review

The live signed-out homepage was captured after the `5194b80` release. At **320 px** and **360 px**, the unchanged hero composition retained its black-and-gold background, headline, proportions, and mobile header. The new **Create Profile** primary action and **Enter the Ecosystem** secondary action appeared as two separate full-width, vertically stacked controls within the viewport. Both labels remained fully visible and no horizontal overflow was observed.

| Width | CTA result | Layout result |
|---:|---|---|
| 320 px | Create Profile and Enter the Ecosystem both visible | Full-width stacked controls; no observed overflow |
| 360 px | Create Profile and Enter the Ecosystem both visible | Full-width stacked controls; no observed overflow |
| 375 px | Create Profile and Enter the Ecosystem both visible | Full-width stacked controls; no observed overflow |
| 390 px | Create Profile and Enter the Ecosystem both visible | Full-width stacked controls; no observed overflow |
| 412 px | Create Profile and Enter the Ecosystem both visible | Full-width stacked controls; no observed overflow |
| 430 px | Create Profile and Enter the Ecosystem both visible | Full-width stacked controls; no observed overflow |

## Account-state and route review

The signed-out production hero rendered **Create Profile** with the direct existing-account route `/account/signup.html`. Following the action opened the established `Create Account | 7Tribes` page without submitting a form or creating an account.

After the user signed in to the existing 7Tribes Account flow, the live homepage changed that same hero action to **My Account** and exposed the existing `/account/` destination. **Enter the Ecosystem** remained the secondary hero action, and the broader **Join 7Tribes** calls remained elsewhere on the homepage.

## Release note

The CTA release was safely rebased onto the intervening upstream `chore: refresh metrics [skip ci]` commit, preserving its timestamp-only metrics update and the focused homepage change.
