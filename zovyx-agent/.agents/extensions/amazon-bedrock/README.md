# Zuvix Amazon Bedrock Provider

Official Zuvix provider plugin for Amazon Bedrock. It adds Bedrock model discovery, text generation, embeddings, and guardrail-aware provider routing for agents that use AWS-hosted models.

Install from Zuvix:

```bash
zuvix plugin add @zuvix/amazon-bedrock-provider
```

Configure AWS credentials and region through your normal Zuvix credential/profile setup, then select Bedrock models with the `amazon-bedrock/...` provider prefix.
