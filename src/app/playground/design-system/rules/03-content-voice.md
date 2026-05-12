# 03 — Content & Voice

Prototype copy is part of design. Bad copy makes a working prototype feel wrong even when the interaction is right. Good copy lets a reviewer focus on the idea instead of the words.

## Voice

Stellar Lab is a developer tool. The voice is:

- **Direct** — say what the thing does, not how it makes you feel
- **Precise** — use exact terminology (transaction, XDR, RPC, Soroban) rather than vague approximations
- **Calm** — no exclamation marks, no marketing language, no "✨ Magic ✨"
- **Helpful when it matters** — error messages and empty states are where voice matters most

## Capitalization

Use **sentence case** for everything except proper nouns:

- ✅ "Save transaction"
- ✅ "Build a transaction on Mainnet"
- ❌ "Save Transaction"
- ❌ "BUILD A TRANSACTION"

Proper nouns stay capitalized: Stellar, Mainnet, Testnet, Futurenet, Horizon, Soroban, XDR, RPC.

## Microcopy patterns

### Buttons

Verb first, object after when the object isn't obvious from context:

- ✅ "Sign transaction"
- ✅ "Submit"  (when the context is obviously a transaction)
- ❌ "Click here to sign your transaction now"

### Labels

Noun, short. The field's purpose should be obvious without help text.

- ✅ "Public key"
- ✅ "Amount"
- ❌ "Enter the public key of the account you want to send to"

### Help text

Only when truly needed. If a label requires a paragraph to explain, the field is probably wrong.

### Errors

Tell the person what is wrong and what to do. Avoid blame.

- ✅ "Public key is required."
- ✅ "Invalid Stellar public key. It should start with G and be 56 characters."
- ❌ "You entered an invalid public key."
- ❌ "Error: validation failed."

This matches the existing pattern in `src/validate/methods/` — `get*Error()` returns the message string.

### Empty states

An empty state should explain (a) what would normally be here, and (b) how to get something here.

- ✅ "No saved transactions yet. Build one and click Save to add it here."
- ❌ "Nothing to show."

## Placeholder data in prototypes

When mocking data, use plausible Stellar values, not Lorem Ipsum or "Foo Bar":

- ✅ Public keys: `GCFXHS4GXL6BVUCXBWXGTITROWLVYXQKQLF4YH5O5JT3YZXCYPAFBJZB` (use real-shaped values; from testnet is fine)
- ✅ Amounts: realistic XLM amounts (e.g. `100.0000000`, not `999999999`)
- ✅ Names/labels: short and product-appropriate ("My savings account", "Soroban test contract")
- ❌ `aaa`, `test`, `asdf`, `1234`
- ❌ Lorem ipsum

Realistic mock data makes the prototype reviewable. Fake-looking data makes reviewers comment on the data instead of the idea.

## Things to avoid

- Emojis in product UI (rare exceptions: a single emoji in an empty state illustration is okay; in buttons or labels is not)
- "Please" — usually adds nothing
- "Sorry" — error messages should be informative, not apologetic
- "Click here" — the link or button text should say what it does
- Marketing words: "powerful", "seamless", "intuitive", "leverage", "unlock"
