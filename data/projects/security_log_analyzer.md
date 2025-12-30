---
title: "Security Log Analyzer Dashboard + SOC Assistant"
slug: "security-log-analyzer"
tags: ["Security", "Python", "FastAPI", "LLM", "Dashboards"]
status: "Planned"
stack: ["Python", "FastAPI", "Streamlit", "Chroma", "Docker"]
url: "/projects/security-log-analyzer/"
github: "https://github.com/AlejLr/"
---

## Summary
End-to-end pipeline to ingest, parse, detect anomalies in security logs and visualize them in a dashboard. Includes an LLM SOC assistant for triage and investigation support.

## Key Features
- Failed login surge detection
- Brute force attempts & suspicious IP scoring
- Interactive dashboard and incident summaries

## Architecture
Logs → parsing → feature extraction → detections → dashboard + SOC assistant.
