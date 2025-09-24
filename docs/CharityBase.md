# CharityBase API

> !!! Error !!! The CharityBase API is currently down :( 
> We can't use this for the hackathon, so I've refactored to use OpenAI's web search tool
> You can ignore this page.

CharityBase provides UK charity data via a GraphQL API. Read the docs here: https://charitybase.uk/docs

## Getting an API Key

1. Visit https://charitybase.uk/console/keys
2. Sign up for a free account
3. Generate API key from dashboard
4. Add to your environment variables as `CHARITYBASE_API_KEY`

## GraphQL playground and example query 

https://charitybase.uk/api/graphql

Go to the playground linked above, and paste in the following query: 

```graphql
{
  CHC {
    getCharities(filters: { search: "Royal Marsden Cancer Charity" }) {
      count
      list(limit: 1) {
        id
        names { value }
        activities
        contact {
          address
        }
        finances {
          spending
          income
        }
        trustees {
          name
        }
      }
    }
  }
}
```

You can use the `Control` + `Space` keys on MacOS to autosuggest more fields, or use the `docs` tab on the right for an overview of all options.
