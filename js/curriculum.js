const CURRICULUM = [
  {
    id: "cicd-fundamentals",
    title: "CI/CD Fundamentals",
    icon: "🔄",
    desc: "Core concepts every CI/CD TPM must know",
    lessons: [
      {
        id: "what-is-cicd",
        title: "What is CI/CD?",
        duration: "8 min read",
        content: `
<h3>The Core Problem CI/CD Solves</h3>
<p>Before CI/CD, software teams would work in isolation for weeks or months, then attempt to merge everything at once — a painful process called "integration hell." CI/CD eliminates this by making integration and delivery a continuous, automated process.</p>

<h3>Continuous Integration (CI)</h3>
<p>CI is the practice of frequently merging developer code changes into a shared repository — often multiple times per day. Each merge triggers an automated pipeline that:</p>
<ul>
  <li>Compiles/builds the application</li>
  <li>Runs unit and integration tests</li>
  <li>Performs static code analysis and security scans</li>
  <li>Reports pass/fail back to the developer immediately</li>
</ul>
<p>The key principle: <strong>fail fast, fix fast</strong>. Problems found minutes after writing code are far cheaper to fix than problems found weeks later.</p>

<h3>Continuous Delivery (CD)</h3>
<p>CD extends CI by automatically preparing every successful build for release to production. The code is always in a deployable state. A human still approves the final production push.</p>

<h3>Continuous Deployment</h3>
<p>A step beyond Continuous Delivery — every change that passes all automated tests is automatically deployed to production with <em>no human approval</em>. Used by companies like Amazon (thousands of deployments/day). In banking, this is rare due to compliance requirements.</p>

<div class="tip"><strong>TPM Context:</strong> As a TPM at a bank, you'll almost certainly work with Continuous Delivery (not Deployment). Regulatory controls, change management, and audit trails require human approval gates before production releases.</div>

<h3>The CI/CD Pipeline</h3>
<p>A pipeline is the automated sequence of stages code passes through. A typical banking pipeline looks like:</p>
<ol>
  <li><strong>Source</strong> — Developer pushes code to Git</li>
  <li><strong>Build</strong> — Compile code, create artifact (JAR, Docker image, etc.)</li>
  <li><strong>Test</strong> — Unit tests, integration tests, code coverage</li>
  <li><strong>Security Scan</strong> — SAST, SCA, secret detection</li>
  <li><strong>Staging Deploy</strong> — Deploy to non-production environment</li>
  <li><strong>Acceptance Tests</strong> — Automated end-to-end tests</li>
  <li><strong>Approval Gate</strong> — Human sign-off (change management)</li>
  <li><strong>Production Deploy</strong> — Release to production</li>
</ol>

<h3>Key Metrics TPMs Track</h3>
<ul>
  <li><strong>Lead Time for Changes</strong> — Time from code commit to production</li>
  <li><strong>Deployment Frequency</strong> — How often you deploy to production</li>
  <li><strong>Change Failure Rate</strong> — % of deployments causing incidents</li>
  <li><strong>Mean Time to Recovery (MTTR)</strong> — How fast you recover from failures</li>
</ul>
<p>These four are the DORA metrics — the industry standard for measuring DevOps/CI/CD performance.</p>`,
        takeaways: [
          "CI = automate build+test on every commit; CD = always deployable",
          "Banks use Continuous Delivery (human approval gates), not Continuous Deployment",
          "A pipeline is the ordered sequence of automated stages",
          "DORA metrics: Lead Time, Deploy Frequency, Change Failure Rate, MTTR"
        ],
        resources: [
          { type: "article", title: "DORA State of DevOps Report", desc: "Annual benchmark report on CI/CD performance", url: "https://dora.dev/research/" },
          { type: "book", title: "The DevOps Handbook", desc: "Gene Kim et al — foundational CI/CD theory", url: "https://itrevolution.com/product/the-devops-handbook/" },
          { type: "docs", title: "GitLab CI/CD Concepts", desc: "Official GitLab documentation on CI/CD basics", url: "https://docs.gitlab.com/ee/ci/introduction/" },
          { type: "video", title: "CI/CD in 100 Seconds", desc: "Fireship — fast visual overview", url: "https://www.youtube.com/watch?v=scEDHsr3APg" }
        ],
        quiz: [
          {
            q: "A developer merges code and an automated build and test process runs immediately. This is an example of:",
            options: ["Continuous Deployment", "Continuous Integration", "Continuous Delivery", "Change Management"],
            answer: 1,
            explanation: "Continuous Integration (CI) is specifically the practice of automatically building and testing code on every merge/commit to a shared repository."
          },
          {
            q: "At a large bank, why is Continuous Deployment (auto-deploy to prod) rarely used?",
            options: ["The technology isn't mature enough", "It requires too many developers", "Regulatory, compliance, and change management requirements mandate human approval gates", "Continuous Deployment is the same as Continuous Delivery"],
            answer: 2,
            explanation: "Financial institutions are subject to strict regulatory frameworks (SOX, OCC, etc.) that require documented human approval before production changes — making fully automated deployment to production impractical."
          },
          {
            q: "Which DORA metric measures how quickly a team recovers from a production incident?",
            options: ["Lead Time for Changes", "Deployment Frequency", "Change Failure Rate", "Mean Time to Recovery (MTTR)"],
            answer: 3,
            explanation: "MTTR (Mean Time to Recovery) measures the average time to restore service after a production failure. It's a key indicator of team resilience and operational maturity."
          },
          {
            q: "What is the correct order of a typical banking CI/CD pipeline?",
            options: [
              "Deploy → Build → Test → Security Scan → Approval",
              "Build → Test → Security Scan → Approval → Deploy",
              "Test → Build → Deploy → Security Scan → Approval",
              "Security Scan → Test → Build → Approval → Deploy"
            ],
            answer: 1,
            explanation: "The standard flow is: Build (compile/package) → Test (unit/integration) → Security Scan → Approval Gate → Deploy. You must build before you can test, and security + approval happen before production deployment."
          },
          {
            q: "Every passing build is automatically released to production with no human approval. This describes:",
            options: ["Continuous Integration", "Continuous Delivery", "Continuous Deployment", "DevOps"],
            answer: 2,
            explanation: "Continuous Deployment means every change that passes automated tests goes directly to production automatically. Continuous Delivery means it's ready to deploy but a human still approves the final push."
          }
        ]
      },
      {
        id: "pipeline-anatomy",
        title: "Anatomy of a Pipeline",
        duration: "10 min read",
        content: `
<h3>Stages, Jobs, and Steps</h3>
<p>Pipelines are organized hierarchically. Understanding this structure is critical for conversations with your engineering team.</p>
<ul>
  <li><strong>Pipeline</strong> — The entire automated workflow triggered by a code event</li>
  <li><strong>Stage</strong> — A logical phase (build, test, deploy). Stages run sequentially.</li>
  <li><strong>Job</strong> — A unit of work within a stage. Jobs within the same stage can run in parallel.</li>
  <li><strong>Step/Script</strong> — Individual commands executed within a job</li>
</ul>

<h3>Triggers</h3>
<p>Pipelines are triggered by events:</p>
<ul>
  <li><strong>Push trigger</strong> — Every commit to any branch</li>
  <li><strong>Merge Request (MR) trigger</strong> — When a PR/MR is opened or updated</li>
  <li><strong>Schedule trigger</strong> — Cron-based (e.g., nightly security scans)</li>
  <li><strong>Manual trigger</strong> — Human clicks "run"</li>
  <li><strong>API trigger</strong> — Another system calls the pipeline API</li>
</ul>

<h3>Artifacts</h3>
<p>An <strong>artifact</strong> is any file produced by a pipeline job that needs to be passed downstream or stored. Examples:</p>
<ul>
  <li>Compiled binaries / JAR files</li>
  <li>Docker images</li>
  <li>Test reports (JUnit XML, code coverage HTML)</li>
  <li>Security scan reports</li>
  <li>Packaged mobile apps (.ipa, .apk)</li>
</ul>

<h3>Environments</h3>
<p>A mature pipeline deploys to multiple environments in sequence:</p>
<ul>
  <li><strong>Dev</strong> — Developer sandbox, auto-deployed on every commit</li>
  <li><strong>SIT (System Integration Testing)</strong> — Shared test environment, integration tested</li>
  <li><strong>UAT (User Acceptance Testing)</strong> — Business stakeholders validate here</li>
  <li><strong>Staging / Pre-Prod</strong> — Production mirror, final validation</li>
  <li><strong>Production</strong> — Live system, requires change management approval</li>
</ul>

<div class="warning"><strong>Banking Note:</strong> In financial institutions, promoting between UAT → Staging → Production typically requires a formal Change Request (CR) in a system like ServiceNow, with CAB (Change Advisory Board) approval. This is your pipeline's approval gate.</div>

<h3>Cache vs Artifacts</h3>
<p><strong>Cache</strong> speeds up pipelines by reusing data between runs (e.g., downloaded npm/Maven dependencies). <strong>Artifacts</strong> pass data between jobs/stages within a single pipeline run. They serve different purposes — mixing them up causes pipeline failures or stale data bugs.</p>

<h3>Pipeline as Code</h3>
<p>Modern pipelines are defined in YAML files stored in the repository itself:</p>
<pre><code># .gitlab-ci.yml example
stages:
  - build
  - test
  - security
  - deploy

build-job:
  stage: build
  script:
    - mvn clean package
  artifacts:
    paths:
      - target/*.jar

unit-tests:
  stage: test
  script:
    - mvn test
</code></pre>
<p>Storing pipeline config in source control means it's versioned, reviewable, and auditable — important for SOX compliance at banks.</p>`,
        takeaways: [
          "Pipeline hierarchy: Pipeline → Stages (sequential) → Jobs (parallel) → Steps",
          "Jobs in the same stage run in parallel; stages run sequentially",
          "Artifacts pass files between jobs; cache speeds up repeated dependency downloads",
          "Banking pipelines require change management gates (ServiceNow/CAB) before production",
          "Pipeline-as-code (.gitlab-ci.yml) enables versioning and audit trails"
        ],
        resources: [
          { type: "docs", title: "GitLab CI/CD Pipeline Architecture", desc: "Official reference for pipelines, stages, jobs", url: "https://docs.gitlab.com/ee/ci/pipelines/" },
          { type: "article", title: "Pipeline as Code Best Practices", desc: "ThoughtWorks guide to maintainable pipelines", url: "https://www.thoughtworks.com/insights/blog/cd-pipeline-software-delivery" },
          { type: "video", title: "GitLab CI/CD Full Tutorial", desc: "TechWorld with Nana — comprehensive walkthrough", url: "https://www.youtube.com/watch?v=qP8kir2GUgo" }
        ],
        quiz: [
          {
            q: "Within a single pipeline stage, multiple jobs are configured. How do these jobs run by default?",
            options: ["Sequentially, one after another", "In parallel, simultaneously", "Based on alphabetical order", "The slowest job runs first"],
            answer: 1,
            explanation: "Jobs within the same stage run in parallel by default (assuming enough runners are available). Stages themselves run sequentially — stage 2 doesn't start until all jobs in stage 1 complete."
          },
          {
            q: "What is the purpose of pipeline artifacts (vs cache)?",
            options: [
              "Speed up pipelines by reusing downloaded dependencies",
              "Store pipeline logs for audit purposes",
              "Pass files produced by one job to downstream jobs/stages",
              "Trigger pipelines from external systems"
            ],
            answer: 2,
            explanation: "Artifacts are files produced by a job (e.g., compiled JAR, test report) that are passed to downstream jobs or stored for later use. Cache is for reusing things like dependency downloads between pipeline runs to save time."
          },
          {
            q: "Your team wants to automatically run a security scan every night at 2am, independent of code commits. Which trigger type should they use?",
            options: ["Push trigger", "Merge Request trigger", "Schedule trigger", "Manual trigger"],
            answer: 2,
            explanation: "A schedule trigger (cron-based) runs a pipeline at a specified time interval, independent of developer activity. This is commonly used for nightly security scans, dependency audits, and compliance checks."
          },
          {
            q: "In a banking context, what typically controls the promotion from UAT to Production in a CI/CD pipeline?",
            options: [
              "An automated test coverage threshold",
              "A formal Change Request and CAB approval (e.g., via ServiceNow)",
              "The developer who wrote the code",
              "A Docker image version tag"
            ],
            answer: 1,
            explanation: "Banks operate under change management frameworks requiring formal Change Requests with CAB (Change Advisory Board) approval before production deployments. This maps to a manual approval gate in the CI/CD pipeline, often integrated with ServiceNow."
          },
          {
            q: "Why is storing pipeline configuration (.gitlab-ci.yml) in source control important for a bank?",
            options: [
              "It makes the pipeline run faster",
              "It allows pipelines to run on more servers",
              "It enables versioning, peer review, and audit trails required for SOX compliance",
              "It reduces the cost of CI/CD infrastructure"
            ],
            answer: 2,
            explanation: "SOX and other financial regulations require audit trails for changes to production systems — including the pipeline itself. Storing pipeline config in Git means every change is tracked, attributable, and reviewable."
          }
        ]
      }
    ]
  },
  {
    id: "gitlab-runners",
    title: "GitLab & Runners",
    icon: "🦊",
    desc: "GitLab CI/CD, runner types, configuration, and scaling",
    lessons: [
      {
        id: "gitlab-overview",
        title: "GitLab CI/CD Overview",
        duration: "9 min read",
        content: `
<h3>Why GitLab?</h3>
<p>GitLab is a complete DevSecOps platform — it combines source control (Git), CI/CD pipelines, security scanning, container registry, package registry, and more in a single application. For a bank, this consolidation is valuable: fewer vendor integrations, unified audit logs, and a single access control system.</p>

<h3>GitLab vs GitHub Actions vs Jenkins</h3>
<ul>
  <li><strong>GitLab CI/CD</strong> — Deeply integrated with GitLab repos; pipeline config lives in <code>.gitlab-ci.yml</code>; strong security scanning built-in; preferred for enterprises needing self-hosted</li>
  <li><strong>GitHub Actions</strong> — Native to GitHub; huge marketplace of pre-built actions; popular for open source; Microsoft/Azure ecosystem</li>
  <li><strong>Jenkins</strong> — Legacy, highly configurable, self-hosted; common in older banking environments; high maintenance overhead; Jenkinsfile (Groovy DSL)</li>
</ul>
<div class="tip"><strong>TPM Insight:</strong> Many large banks are mid-migration from Jenkins to GitLab. You may manage both simultaneously. Understanding the differences helps you speak to migration ROI.</div>

<h3>The .gitlab-ci.yml File</h3>
<p>Every GitLab pipeline starts with a YAML file at the root of the repository. Key concepts:</p>
<ul>
  <li><strong>stages</strong> — Defines the pipeline stage order</li>
  <li><strong>variables</strong> — Environment variables (secrets stored in GitLab UI, not the file)</li>
  <li><strong>rules / only / except</strong> — Control when jobs run (e.g., only on main branch)</li>
  <li><strong>needs</strong> — Creates job dependencies, enabling directed acyclic graph (DAG) pipelines</li>
  <li><strong>include</strong> — References shared pipeline templates (key for large organizations)</li>
  <li><strong>extends</strong> — Inherits configuration from a base job template</li>
</ul>

<h3>Merge Requests and Pipelines</h3>
<p>GitLab integrates pipelines with Merge Requests (MRs — GitLab's equivalent of GitHub Pull Requests). You can configure:</p>
<ul>
  <li>Required pipeline success before merge</li>
  <li>Merge trains (queue MRs for sequential merging)</li>
  <li>Protected branches (only passing pipelines can merge to <code>main</code>)</li>
  <li>Approval rules (require N reviewers before merge)</li>
</ul>

<h3>GitLab Environments and Deployments</h3>
<p>GitLab tracks deployments to named environments (dev, staging, production) and shows deployment history, who deployed, and when — valuable for audit trails. You can also configure:</p>
<ul>
  <li><strong>Protected environments</strong> — Only authorized users/roles can deploy</li>
  <li><strong>Deployment approvals</strong> — Require explicit approval before deploying to production</li>
  <li><strong>Auto-rollback</strong> — Automatically revert a failed production deploy</li>
</ul>

<h3>GitLab Templates and Compliance Frameworks</h3>
<p>For a large bank managing hundreds of repositories, you don't want each team writing their own pipeline from scratch. GitLab supports:</p>
<ul>
  <li><strong>CI/CD Templates</strong> — Reusable pipeline snippets maintained centrally</li>
  <li><strong>Compliance Pipelines</strong> — Enforce specific jobs (e.g., security scans) on ALL projects, even if teams forget to include them</li>
  <li><strong>Pipeline execution policies</strong> — Security team can inject mandatory scan jobs across all projects</li>
</ul>`,
        takeaways: [
          "GitLab is a full DevSecOps platform — not just a CI tool",
          "Banks often migrate from Jenkins → GitLab; you may run both",
          ".gitlab-ci.yml is pipeline-as-code — versioned, auditable",
          "Protected environments + deployment approvals = compliance-friendly CD",
          "Compliance Pipelines let security teams enforce mandatory scans across all repos"
        ],
        resources: [
          { type: "docs", title: "GitLab CI/CD YAML Reference", desc: "Complete .gitlab-ci.yml keyword reference", url: "https://docs.gitlab.com/ee/ci/yaml/" },
          { type: "docs", title: "GitLab Compliance Pipelines", desc: "Enforce pipeline jobs across all projects", url: "https://docs.gitlab.com/ee/user/group/compliance_frameworks.html" },
          { type: "article", title: "GitLab vs Jenkins: Migration Guide", desc: "Key differences and migration considerations", url: "https://about.gitlab.com/devops-tools/jenkins-vs-gitlab/" },
          { type: "course", title: "GitLab CI/CD: Pipelines, CI/CD and DevOps", desc: "Udemy course for hands-on GitLab practice", url: "https://www.udemy.com/course/gitlab-ci-pipelines-ci-cd-and-devops-for-beginners/" }
        ],
        quiz: [
          {
            q: "What is the name of the file that defines a GitLab CI/CD pipeline?",
            options: ["Jenkinsfile", "pipeline.yaml", ".gitlab-ci.yml", ".github/workflows/main.yml"],
            answer: 2,
            explanation: ".gitlab-ci.yml is the standard GitLab pipeline configuration file, placed at the root of the repository. It defines stages, jobs, variables, and rules for the pipeline."
          },
          {
            q: "Your bank's security team wants to ensure that ALL projects — even if developers forget — always run a Fortify security scan. Which GitLab feature supports this?",
            options: ["Protected Branches", "Merge Request Approvals", "Compliance Pipelines / Pipeline Execution Policies", "GitLab Runners"],
            answer: 2,
            explanation: "GitLab's Compliance Pipelines and Pipeline Execution Policies allow security/compliance teams to inject mandatory jobs (like security scans) into all project pipelines, even without developer action."
          },
          {
            q: "What is a GitLab Merge Request (MR) equivalent to in GitHub?",
            options: ["A GitHub Issue", "A GitHub Pull Request", "A GitHub Action", "A GitHub Release"],
            answer: 1,
            explanation: "A GitLab Merge Request (MR) is functionally equivalent to a GitHub Pull Request (PR) — both represent a proposed code change from one branch to another, with review, discussion, and pipeline integration."
          },
          {
            q: "A bank wants to ensure only specific people can approve deployments to the production environment. Which GitLab feature handles this?",
            options: ["CI/CD Templates", "Protected Environments with Deployment Approvals", "GitLab Runner Tags", "Cache configuration"],
            answer: 1,
            explanation: "GitLab's Protected Environments feature allows you to restrict who can deploy to an environment (like production) and require explicit deployment approvals — directly supporting change management and compliance requirements."
          }
        ]
      },
      {
        id: "runners-deep-dive",
        title: "GitLab Runners: Types & Architecture",
        duration: "12 min read",
        content: `
<h3>What is a GitLab Runner?</h3>
<p>A GitLab Runner is an agent — a process running on a machine — that picks up pipeline jobs from GitLab and executes them. The GitLab server assigns jobs; the Runner executes them. They communicate via the GitLab API.</p>

<div class="tip"><strong>Analogy:</strong> GitLab is the manager assigning tasks. Runners are the employees doing the work. You can have many runners (employees) handling jobs in parallel.</div>

<h3>Runner Scope</h3>
<ul>
  <li><strong>Shared Runners</strong> — Available to all projects in a GitLab instance. Managed by the platform team. Easiest to use, but shared resources.</li>
  <li><strong>Group Runners</strong> — Available to all projects within a specific GitLab group. Good for a business unit.</li>
  <li><strong>Project Runners</strong> — Dedicated to a single project. Used for projects with special requirements (compliance isolation, specific hardware).</li>
</ul>

<h3>Runner Executors</h3>
<p>The executor defines <em>how</em> the Runner runs jobs. This is critical to understand for infrastructure conversations:</p>
<ul>
  <li><strong>Shell executor</strong> — Runs jobs directly on the Runner machine's shell. Simple but no isolation between jobs. Risky for security — not recommended for shared runners.</li>
  <li><strong>Docker executor</strong> — Each job runs in a fresh Docker container. Strong isolation. Most common in modern setups. Requires Docker on the runner host.</li>
  <li><strong>Docker+Machine (auto-scaling)</strong> — Dynamically provisions cloud VMs for each job, then destroys them. Used with AWS/Azure/GCP for elastic scaling. Cost-efficient at scale.</li>
  <li><strong>Kubernetes executor</strong> — Each job runs in a Kubernetes Pod. Best for large-scale, cloud-native environments. Integrates with AWS EKS / Azure AKS.</li>
  <li><strong>Custom executor</strong> — Define your own execution environment. Used for specialized cases like building on mainframes.</li>
</ul>

<h3>Runner Tags</h3>
<p>Tags are labels you assign to runners and jobs. A job with tag <code>docker-large</code> will only run on runners tagged <code>docker-large</code>. This lets you route jobs to appropriate infrastructure:</p>
<pre><code>build-ios:
  stage: build
  tags:
    - macos
    - xcode-15
  script:
    - xcodebuild -workspace App.xcworkspace -scheme App
</code></pre>
<p>Common tag patterns in banks: <code>linux</code>, <code>windows</code>, <code>macos</code>, <code>docker</code>, <code>high-memory</code>, <code>gpu</code>, <code>dmz</code>.</p>

<h3>Runner Registration and Security</h3>
<p>Runners register with GitLab using a <strong>registration token</strong> (being replaced by the newer <strong>runner authentication token</strong> model). Key security considerations for a bank:</p>
<ul>
  <li>Runners should run in isolated network segments</li>
  <li>Production runners should have no internet access (egress control)</li>
  <li>Secrets/credentials should be stored in GitLab CI/CD Variables (masked + protected), never in the YAML file</li>
  <li>Runner hosts should be treated as privileged infrastructure — access control, patching, monitoring</li>
  <li>Privileged mode (needed for Docker-in-Docker) should be avoided or tightly controlled</li>
</ul>

<h3>Scaling Runners in AWS/Azure</h3>
<p>For large banking environments, runners are often auto-scaled:</p>
<ul>
  <li><strong>AWS</strong>: EC2 Auto Scaling Groups + GitLab Runner Manager with Docker Machine, or EKS (Kubernetes executor)</li>
  <li><strong>Azure</strong>: Azure VM Scale Sets or AKS (Azure Kubernetes Service)</li>
  <li><strong>On-Prem</strong>: VMware vSphere or bare metal for air-gapped environments</li>
</ul>
<p>The platform team typically manages runner infrastructure. As TPM, you need to understand capacity planning — too few runners = queue buildup = developer frustration.</p>`,
        takeaways: [
          "Runners are agents that execute pipeline jobs — scoped as shared, group, or project",
          "Executor type determines isolation: Shell (none) → Docker (container) → Kubernetes (pod)",
          "Tags route specific jobs to appropriate runner infrastructure",
          "Runner security is critical — treat runner hosts as privileged infrastructure",
          "Auto-scaling runners (EKS/AKS/EC2) optimize cost and handle pipeline bursts"
        ],
        resources: [
          { type: "docs", title: "GitLab Runner Documentation", desc: "Official docs: install, configure, executor types", url: "https://docs.gitlab.com/runner/" },
          { type: "docs", title: "GitLab Runner Autoscaling on AWS", desc: "EC2 + Docker Machine autoscaling setup", url: "https://docs.gitlab.com/runner/configuration/runner_autoscale_aws/" },
          { type: "article", title: "GitLab Runner Security Best Practices", desc: "Securing runners in enterprise environments", url: "https://docs.gitlab.com/ee/security/runner_security.html" },
          { type: "video", title: "GitLab Runners Explained", desc: "Hands-on runner setup and configuration", url: "https://www.youtube.com/watch?v=G8ZONFOTu9Q" }
        ],
        quiz: [
          {
            q: "A GitLab Runner is available to ALL projects in the GitLab instance. What type of runner is this?",
            options: ["Project Runner", "Group Runner", "Shared Runner", "Dedicated Runner"],
            answer: 2,
            explanation: "Shared Runners are available to all projects in a GitLab instance and are managed by the platform/infrastructure team. Project Runners are dedicated to one project; Group Runners serve all projects within a group."
          },
          {
            q: "Your iOS mobile build jobs must run on a Mac with Xcode. How do you ensure these jobs ONLY run on the Mac runner?",
            options: [
              "Set the job's image to 'macos'",
              "Configure a protected environment",
              "Assign tags to the Mac runner and add matching tags to the iOS job",
              "Use a separate .gitlab-ci.yml file for iOS"
            ],
            answer: 2,
            explanation: "Runner tags are the mechanism for routing jobs to specific runners. You tag the Mac runner (e.g., 'macos', 'xcode-15') and add those same tags to your iOS jobs. The job will only be picked up by runners with matching tags."
          },
          {
            q: "Which executor provides the strongest job isolation for a shared runner in a banking environment?",
            options: ["Shell executor", "Docker executor", "SSH executor", "Parallels executor"],
            answer: 1,
            explanation: "The Docker executor runs each job in a fresh, isolated container that is destroyed after the job completes. This prevents job bleed (credentials, files) between different teams' jobs — critical for a shared enterprise runner."
          },
          {
            q: "A developer stores an AWS access key directly in the .gitlab-ci.yml file. What is the primary security risk?",
            options: [
              "The pipeline will run slower",
              "The credential is committed to Git history, visible to anyone with repo access and in audit logs forever",
              "GitLab will reject the pipeline",
              "The runner won't be able to read the variable"
            ],
            answer: 1,
            explanation: "Secrets in code are a critical vulnerability. They're committed to Git history (hard to fully remove), visible to all repo contributors, logged in pipeline output, and may violate banking security policies. Secrets must be stored in GitLab's masked CI/CD Variables, never in code."
          },
          {
            q: "Your pipeline queue is backing up — developers are waiting 20 minutes for jobs to start. As TPM, what is the most likely root cause to investigate?",
            options: [
              "The .gitlab-ci.yml file has syntax errors",
              "Insufficient runner capacity — not enough runners to handle concurrent jobs",
              "Protected branches blocking pipeline execution",
              "GitLab's server is down"
            ],
            answer: 1,
            explanation: "Long queue times are a classic sign of runner capacity constraints. When more jobs are created than there are runners to execute them, jobs queue. The fix is typically adding more runners or enabling auto-scaling infrastructure."
          }
        ]
      }
    ]
  },
  {
    id: "security-scanning",
    title: "Security Scanning",
    icon: "🔒",
    desc: "Fortify, Synopsys, FOSSA — SAST, DAST, SCA in banking pipelines",
    lessons: [
      {
        id: "security-overview",
        title: "Security Scanning in CI/CD Pipelines",
        duration: "10 min read",
        content: `
<h3>Why Security Scanning is Non-Negotiable in Banking</h3>
<p>Financial institutions are prime targets for cyberattacks and face strict regulatory requirements (OCC, FFIEC, PCI-DSS, SOX). Embedding security into the CI/CD pipeline — "shifting security left" — means finding vulnerabilities before code reaches production, when they're cheapest to fix.</p>

<h3>Types of Security Scanning</h3>
<ul>
  <li><strong>SAST (Static Application Security Testing)</strong> — Analyzes source code or compiled binaries without running the application. Finds: SQL injection, XSS, buffer overflows, insecure crypto, hardcoded secrets. Tools: <em>Fortify SCA, Checkmarx, SonarQube</em></li>
  <li><strong>DAST (Dynamic Application Security Testing)</strong> — Tests a running application by sending malicious inputs. Finds: Authentication flaws, runtime injection, insecure headers. Tools: <em>Synopsys DAST (formerly WebInspect), OWASP ZAP, Burp Suite Enterprise</em></li>
  <li><strong>SCA (Software Composition Analysis)</strong> — Scans open-source dependencies for known CVEs and license compliance issues. Finds: Vulnerable libraries (e.g., Log4Shell), GPL license violations. Tools: <em>FOSSA, Synopsys Black Duck, Snyk</em></li>
  <li><strong>Secret Detection</strong> — Scans for accidentally committed credentials, API keys, tokens. Tools: <em>GitLab Secret Detection, Gitleaks, TruffleHog</em></li>
  <li><strong>Container Scanning</strong> — Scans Docker images for OS-level CVEs. Tools: <em>Trivy, Grype, Synopsys Seeker, AWS ECR scanning</em></li>
</ul>

<h3>Fortify (OpenText)</h3>
<p>Fortify is one of the most widely used SAST tools in enterprise banking. Two main products:</p>
<ul>
  <li><strong>Fortify SCA (Source Code Analyzer)</strong> — Runs locally or in CI/CD. Performs deep static analysis. Can be slow (hours for large codebases). Produces FPR report files.</li>
  <li><strong>Fortify on Demand (FoD)</strong> — Cloud-based SaaS version. Submit code, results returned asynchronously. Popular for banks wanting managed scanning without infrastructure overhead.</li>
</ul>
<div class="tip"><strong>TPM Note:</strong> Fortify scans can take 1-4 hours for large Java codebases. This impacts pipeline duration and developer experience. You'll need to balance thoroughness vs. speed — often by running full Fortify scans nightly and quick scans on MRs.</div>

<h3>Synopsys</h3>
<p>Synopsys offers a comprehensive suite covering multiple scan types:</p>
<ul>
  <li><strong>Coverity</strong> — SAST for C/C++, Java, and more. Strong in financial services for embedded/native code.</li>
  <li><strong>Black Duck</strong> — Industry-leading SCA. Identifies open-source components, CVEs, and license risks. Critical for banks with open-source governance policies.</li>
  <li><strong>Seeker</strong> — IAST (Interactive Application Security Testing) — instruments running app to detect vulnerabilities during functional testing.</li>
</ul>

<h3>FOSSA</h3>
<p>FOSSA focuses on Software Composition Analysis (SCA) with an emphasis on <strong>license compliance</strong> — critical for banks that cannot use GPL-licensed code in commercial products. Key capabilities:</p>
<ul>
  <li>Dependency graph visualization</li>
  <li>License obligation management (copyleft detection)</li>
  <li>CVE tracking with CVSS scoring</li>
  <li>Policy-as-code: fail pipelines when unapproved licenses are detected</li>
</ul>

<h3>Integrating Security Scans into Pipelines</h3>
<p>A typical banking pipeline security stage:</p>
<pre><code>security-scan:
  stage: security
  script:
    - fossa analyze          # SCA: dependency scan
    - fossa test             # Fail if policy violated
  allow_failure: false       # Block pipeline on violation

fortify-sast:
  stage: security
  script:
    - sourceanalyzer -b $CI_PROJECT_NAME -scan
    - BIRTReportGenerator     # Generate report
  artifacts:
    paths:
      - "*.fpr"              # Fortify results file
  rules:
    - if: $CI_COMMIT_BRANCH == "main"  # Only on main branch
</code></pre>`,
        takeaways: [
          "SAST = static code analysis (Fortify, Checkmarx); DAST = test running app; SCA = open-source CVEs + licenses (FOSSA, Black Duck)",
          "Fortify SCA is slow (hours) — run full scans nightly, quick/incremental on MRs",
          "FOSSA specializes in license compliance — critical for banks with open-source governance",
          "Synopsys Black Duck is the enterprise SCA leader; Coverity for C/C++ SAST",
          "'Shift left' = find security issues in development, not production"
        ],
        resources: [
          { type: "docs", title: "Fortify SCA User Guide", desc: "OpenText Fortify documentation and pipeline integration", url: "https://www.microfocus.com/documentation/fortify-source-code-analyzer/" },
          { type: "docs", title: "FOSSA Documentation", desc: "FOSSA SCA setup and CI/CD integration", url: "https://docs.fossa.com/" },
          { type: "docs", title: "Synopsys Black Duck Docs", desc: "Black Duck SCA integration guides", url: "https://documentation.blackduck.com/" },
          { type: "article", title: "OWASP DevSecOps Guideline", desc: "Industry standard for security in CI/CD pipelines", url: "https://owasp.org/www-project-devsecops-guideline/" },
          { type: "article", title: "GitLab Security Scanning Overview", desc: "Built-in GitLab security tools and integrations", url: "https://docs.gitlab.com/ee/user/application_security/" }
        ],
        quiz: [
          {
            q: "A scan finds a known critical vulnerability (CVE) in a third-party library your application depends on. Which type of scan caught this?",
            options: ["SAST (Static Application Security Testing)", "DAST (Dynamic Application Security Testing)", "SCA (Software Composition Analysis)", "Secret Detection"],
            answer: 2,
            explanation: "SCA (Software Composition Analysis) specifically scans your application's open-source and third-party dependencies against databases of known vulnerabilities (CVEs). Tools like FOSSA and Synopsys Black Duck specialize in this."
          },
          {
            q: "Your bank has a policy prohibiting GPL-licensed open-source code in commercial products. Which tool is best suited to enforce this in your CI/CD pipeline?",
            options: ["Fortify SCA", "FOSSA", "GitLab Secret Detection", "Synopsys Coverity"],
            answer: 1,
            explanation: "FOSSA specializes in license compliance management. It can detect open-source licenses (including GPL/copyleft), and its policy-as-code feature can automatically fail pipelines when unapproved licenses are detected."
          },
          {
            q: "Fortify SAST scans are taking 3 hours and blocking developer pipelines. As TPM, what is the best strategy?",
            options: [
              "Remove Fortify from the pipeline — it's too slow",
              "Run full Fortify scans only on the main branch or nightly; use incremental/quick scans on merge requests",
              "Require developers to run scans manually before committing",
              "Switch to a different programming language"
            ],
            answer: 1,
            explanation: "The standard enterprise approach is tiered scanning: fast/incremental scans on every MR for quick feedback, and full deep scans on main branch merges or nightly schedules. This balances developer experience with thorough security coverage."
          },
          {
            q: "Which Synopsys product would you recommend for scanning a large Java application's source code for security vulnerabilities (SAST)?",
            options: ["Black Duck", "Seeker", "Coverity", "WhiteSource"],
            answer: 2,
            explanation: "Synopsys Coverity is a SAST tool that performs static code analysis on source code. Black Duck is for SCA (open-source components), and Seeker is IAST (tests running applications). WhiteSource is a separate company (now Mend)."
          }
        ]
      }
    ]
  },
  {
    id: "cloud-platforms",
    title: "AWS & Azure in CI/CD",
    icon: "☁️",
    desc: "Cloud infrastructure, deployment targets, and managed services for pipelines",
    lessons: [
      {
        id: "aws-cicd",
        title: "AWS for CI/CD Pipelines",
        duration: "11 min read",
        content: `
<h3>AWS as a CI/CD Platform</h3>
<p>AWS provides both the <em>infrastructure to run pipelines</em> and the <em>deployment targets</em> for applications. As a TPM at a bank, you need to understand both layers.</p>

<h3>AWS CI/CD Native Services</h3>
<ul>
  <li><strong>AWS CodePipeline</strong> — Fully managed CI/CD orchestration service. Integrates with CodeCommit, CodeBuild, CodeDeploy, and third-party tools. Less flexible than GitLab but native to AWS.</li>
  <li><strong>AWS CodeBuild</strong> — Managed build service. Compiles code, runs tests, produces artifacts. Scales automatically. Pay per build minute. Used as a GitLab Runner executor alternative.</li>
  <li><strong>AWS CodeDeploy</strong> — Automates application deployments to EC2, Lambda, ECS, or on-premises. Supports blue/green and rolling deployment strategies.</li>
  <li><strong>Amazon ECR (Elastic Container Registry)</strong> — Managed Docker image registry. Stores build artifacts (container images) from CI pipelines.</li>
</ul>
<div class="tip"><strong>At banks using GitLab:</strong> Teams often use GitLab for the pipeline orchestration but deploy TO AWS services. GitLab runners may run on EC2 or EKS, and deployments land on ECS, Lambda, or EC2.</div>

<h3>Key AWS Services as Deployment Targets</h3>
<ul>
  <li><strong>EC2 (Elastic Compute Cloud)</strong> — Virtual machines. Traditional app hosting. Legacy banking apps often live here.</li>
  <li><strong>ECS (Elastic Container Service)</strong> — Managed container orchestration. Runs Docker containers. Two modes: EC2 (you manage VMs) and Fargate (serverless — AWS manages everything).</li>
  <li><strong>EKS (Elastic Kubernetes Service)</strong> — Managed Kubernetes. For teams using Kubernetes for container orchestration. GitLab Kubernetes executor can run pipeline jobs here.</li>
  <li><strong>Lambda</strong> — Serverless functions. Event-driven compute. Good for microservices and event processors.</li>
  <li><strong>S3</strong> — Object storage. Used to store build artifacts, static websites, and deployment packages.</li>
</ul>

<h3>AWS IAM and Pipeline Security</h3>
<p>IAM (Identity and Access Management) controls what pipeline processes can do in AWS. Key banking patterns:</p>
<ul>
  <li><strong>IAM Roles for CI/CD</strong> — Pipeline jobs assume an IAM Role (not a static key) to interact with AWS. Roles are temporary credentials — much safer than long-lived access keys.</li>
  <li><strong>OIDC Federation</strong> — GitLab can use OpenID Connect to assume AWS IAM roles without storing any AWS credentials. This is the modern, keyless approach.</li>
  <li><strong>Least privilege</strong> — CI/CD roles should only have the minimum permissions needed (e.g., push to one specific ECR repo, deploy to one specific ECS cluster)</li>
</ul>

<h3>Deployment Strategies in AWS</h3>
<ul>
  <li><strong>Rolling deployment</strong> — Replace instances one at a time. Minimal downtime, easy rollback.</li>
  <li><strong>Blue/Green deployment</strong> — Run two identical environments (blue=live, green=new). Switch traffic after validation. Zero downtime, instant rollback.</li>
  <li><strong>Canary deployment</strong> — Route a small % of traffic to the new version first. Monitor errors. Gradually increase. Catches problems early with minimal blast radius.</li>
</ul>
<div class="warning"><strong>Banking Note:</strong> Blue/green and canary deployments are heavily favored in banking for zero-downtime releases. Your pipeline needs to support these patterns, which adds complexity to deployment stages.</div>

<h3>Infrastructure as Code (IaC)</h3>
<p>The CI/CD pipeline itself often provisions and manages cloud infrastructure:</p>
<ul>
  <li><strong>Terraform</strong> — Multi-cloud IaC. Define AWS resources in code. Pipeline runs <code>terraform plan</code> (review) then <code>terraform apply</code> (provision).</li>
  <li><strong>AWS CloudFormation</strong> — AWS-native IaC. YAML/JSON templates for AWS resources.</li>
  <li><strong>AWS CDK</strong> — Define infrastructure using TypeScript/Python instead of YAML.</li>
</ul>`,
        takeaways: [
          "AWS provides both pipeline infrastructure (CodeBuild, EC2, EKS) and deployment targets (ECS, Lambda, EC2)",
          "Use IAM Roles + OIDC (not static keys) for pipeline AWS authentication",
          "Blue/green and canary deployments minimize downtime and risk — preferred in banking",
          "Terraform/CloudFormation pipelines automate infrastructure provisioning (IaC)",
          "GitLab runners often run on AWS (EC2/EKS) and deploy TO AWS services"
        ],
        resources: [
          { type: "docs", title: "GitLab + AWS OIDC Integration", desc: "Keyless authentication between GitLab and AWS", url: "https://docs.gitlab.com/ee/ci/cloud_services/aws/" },
          { type: "docs", title: "AWS CodeDeploy Deployment Strategies", desc: "Blue/green, canary, rolling deployment patterns", url: "https://docs.aws.amazon.com/codedeploy/latest/userguide/deployment-strategies.html" },
          { type: "course", title: "AWS for DevOps Engineers", desc: "A Cloud Guru — AWS CI/CD and DevOps services", url: "https://acloudguru.com/course/aws-certified-devops-engineer-professional" },
          { type: "docs", title: "Terraform AWS Provider", desc: "HashiCorp Terraform documentation for AWS", url: "https://registry.terraform.io/providers/hashicorp/aws/latest/docs" }
        ],
        quiz: [
          {
            q: "Your banking team uses GitLab CI/CD but deploys applications to containers on AWS. Which AWS service would host those running containers?",
            options: ["Amazon S3", "AWS Lambda", "Amazon ECS or EKS", "Amazon RDS"],
            answer: 2,
            explanation: "ECS (Elastic Container Service) and EKS (Elastic Kubernetes Service) are AWS's managed container orchestration platforms. They run Docker containers in production. ECS with Fargate is fully serverless; EKS uses Kubernetes."
          },
          {
            q: "Your pipeline needs to push Docker images to AWS and deploy to ECS. What is the most secure way to provide AWS credentials to the GitLab pipeline?",
            options: [
              "Store the AWS access key and secret in the .gitlab-ci.yml file",
              "Hardcode credentials in the Dockerfile",
              "Use OIDC federation so GitLab assumes an IAM Role with temporary credentials — no stored keys",
              "Create a shared AWS account for all CI/CD pipelines"
            ],
            answer: 2,
            explanation: "OIDC (OpenID Connect) federation is the modern, keyless approach. GitLab exchanges a short-lived token for temporary AWS credentials via IAM role assumption. No static keys are stored anywhere, eliminating credential rotation and exposure risk."
          },
          {
            q: "During a production deployment, you want zero downtime and the ability to instantly roll back by switching traffic back to the old version. Which strategy is best?",
            options: ["Rolling deployment", "In-place deployment", "Blue/Green deployment", "Recreate deployment"],
            answer: 2,
            explanation: "Blue/Green deployment maintains two identical environments. Traffic switches from blue (old) to green (new) instantly. Rollback is as simple as switching traffic back to blue — zero downtime in either direction."
          },
          {
            q: "What does AWS EKS provide that is relevant to GitLab CI/CD?",
            options: [
              "A code review tool for GitLab merge requests",
              "Managed Kubernetes that can host GitLab Runners and serve as a deployment target",
              "A replacement for GitLab's .gitlab-ci.yml",
              "Static website hosting"
            ],
            answer: 1,
            explanation: "AWS EKS is managed Kubernetes. It's relevant to CI/CD in two ways: (1) GitLab's Kubernetes executor can run pipeline jobs as EKS Pods, providing elastic scaling; (2) deployed applications often run on EKS as their production environment."
          }
        ]
      }
    ]
  },
  {
    id: "mobile-development",
    title: "Mobile CI/CD",
    icon: "📱",
    desc: "iOS and Android CI/CD pipelines, code signing, and distribution",
    lessons: [
      {
        id: "mobile-cicd",
        title: "Mobile App CI/CD Pipelines",
        duration: "11 min read",
        content: `
<h3>Why Mobile CI/CD is Different</h3>
<p>Mobile CI/CD introduces unique challenges compared to backend services:</p>
<ul>
  <li><strong>Platform-specific build environments</strong> — iOS requires macOS with Xcode (Apple's requirement). Android can build on Linux. You need dedicated Mac runners for iOS.</li>
  <li><strong>Code signing</strong> — Every iOS app must be cryptographically signed with certificates and provisioning profiles. Managing these securely in CI is complex.</li>
  <li><strong>Distribution channels</strong> — Apps ship to App Store / Google Play (not a server). Review times, release tracks, and version management add steps.</li>
  <li><strong>Device fragmentation</strong> — Testing across device types, OS versions, screen sizes. Device farms (AWS Device Farm, BrowserStack) needed for real-device testing.</li>
</ul>

<h3>iOS Pipeline</h3>
<p>A typical iOS CI/CD pipeline in GitLab:</p>
<pre><code>build-ios:
  stage: build
  tags:
    - macos        # Must run on a Mac runner
    - xcode-15
  script:
    - xcodebuild archive
        -workspace MyApp.xcworkspace
        -scheme MyApp
        -archivePath MyApp.xcarchive
    - xcodebuild -exportArchive
        -archivePath MyApp.xcarchive
        -exportPath ./build
        -exportOptionsPlist ExportOptions.plist
  artifacts:
    paths:
      - build/*.ipa
</code></pre>

<h3>Code Signing Management</h3>
<p>The most painful part of iOS CI/CD. Options:</p>
<ul>
  <li><strong>Fastlane Match</strong> — Team code signing tool. Stores encrypted certificates and profiles in a Git repo or cloud storage. All team members and CI runners use the same credentials. Industry standard.</li>
  <li><strong>GitLab CI Variables</strong> — Store base64-encoded certificates as masked CI variables. Decode at build time. More manual but no additional tooling.</li>
  <li><strong>Apple App Store Connect API</strong> — Modern keyless approach for App Store distribution. Uses API keys instead of Apple ID passwords.</li>
</ul>

<h3>Fastlane</h3>
<p>Fastlane is the de facto tool for automating iOS and Android deployments. Used extensively in banking mobile teams:</p>
<ul>
  <li><strong>gym</strong> — Build and package iOS apps</li>
  <li><strong>match</strong> — Code signing management</li>
  <li><strong>pilot</strong> — Upload to TestFlight (Apple's beta distribution)</li>
  <li><strong>deliver</strong> — Submit to App Store</li>
  <li><strong>supply</strong> — Upload to Google Play</li>
  <li><strong>scan</strong> — Run tests</li>
</ul>

<h3>Android Pipeline</h3>
<p>Android builds are more flexible — they run on Linux. A typical Gradle-based pipeline:</p>
<pre><code>build-android:
  stage: build
  image: openjdk:17
  script:
    - ./gradlew assembleRelease    # Build APK
    - ./gradlew bundleRelease      # Build AAB (App Bundle for Play Store)
  artifacts:
    paths:
      - app/build/outputs/
</code></pre>
<p>Android signing uses a <strong>keystore file</strong> — a JKS or PKCS12 file containing the signing key. Store as a masked/protected CI variable (base64 encoded). Never commit to Git.</p>

<h3>Distribution and Release Tracks</h3>
<ul>
  <li><strong>iOS</strong>: TestFlight (internal → external beta) → App Store</li>
  <li><strong>Android</strong>: Internal → Closed Testing → Open Testing → Production (Google Play tracks)</li>
  <li><strong>Enterprise distribution</strong>: Banks often have an internal MDM (Mobile Device Management) system (Intune, AirWatch/Workspace ONE) for distributing internal apps to employee devices without app stores</li>
</ul>

<h3>Mobile Testing in CI/CD</h3>
<ul>
  <li><strong>Unit tests</strong> — XCTest (iOS), JUnit (Android) — run in CI on every commit</li>
  <li><strong>UI tests</strong> — XCUITest (iOS), Espresso (Android) — run on simulators in CI, real devices for release</li>
  <li><strong>AWS Device Farm</strong> — Real device testing on hundreds of physical iOS/Android devices in AWS cloud</li>
  <li><strong>Firebase Test Lab</strong> — Google's equivalent for Android (and some iOS) real-device testing</li>
</ul>`,
        takeaways: [
          "iOS CI requires macOS runners (Apple mandates Xcode on Mac) — plan dedicated Mac infrastructure",
          "Code signing is the hardest part of iOS CI/CD — Fastlane Match is the industry standard solution",
          "Fastlane automates build, sign, test, and distribution for both iOS and Android",
          "Android keystores and iOS certificates must be stored as masked CI variables, never in Git",
          "Banks often use MDM (Intune/Workspace ONE) for internal app distribution to employees"
        ],
        resources: [
          { type: "docs", title: "Fastlane Documentation", desc: "Automating iOS and Android deployment", url: "https://docs.fastlane.tools/" },
          { type: "docs", title: "GitLab iOS/macOS CI Tutorial", desc: "Setting up GitLab CI for iOS apps", url: "https://docs.gitlab.com/ee/ci/ios/" },
          { type: "docs", title: "AWS Device Farm", desc: "Real device testing for iOS and Android", url: "https://docs.aws.amazon.com/devicefarm/latest/developerguide/" },
          { type: "article", title: "iOS Code Signing Guide", desc: "Fastlane's comprehensive code signing explanation", url: "https://codesigning.guide/" },
          { type: "video", title: "Mobile CI/CD with GitLab and Fastlane", desc: "End-to-end mobile pipeline walkthrough", url: "https://www.youtube.com/watch?v=NAv1G79PUHI" }
        ],
        quiz: [
          {
            q: "Why do iOS build jobs in GitLab CI require a macOS runner with a specific tag?",
            options: [
              "GitLab only supports macOS for mobile builds",
              "Apple requires iOS apps to be built on macOS with Xcode — Linux runners cannot build iOS apps",
              "Android apps also require macOS runners",
              "macOS runners are faster than Linux runners"
            ],
            answer: 1,
            explanation: "Apple's toolchain (Xcode, xcodebuild, xcrun, codesign) only runs on macOS. This is a hard Apple requirement — you cannot build or sign iOS apps on Linux or Windows. Banks must maintain dedicated Mac build infrastructure or use a Mac cloud service."
          },
          {
            q: "What does Fastlane Match do?",
            options: [
              "Compares two versions of an app to find differences",
              "Matches developers to appropriate code review tasks",
              "Manages and syncs iOS code signing certificates and provisioning profiles across team and CI",
              "Matches pull requests to pipeline configurations"
            ],
            answer: 2,
            explanation: "Fastlane Match is a code signing management tool that stores and syncs certificates and provisioning profiles in a shared encrypted repository. It solves the problem of code signing credentials becoming inconsistent across team members and CI systems."
          },
          {
            q: "A bank wants to distribute an internal employee-only mobile app without using the public App Store. What technology handles this?",
            options: [
              "TestFlight",
              "Firebase App Distribution",
              "MDM (Mobile Device Management) systems like Microsoft Intune or VMware Workspace ONE",
              "Android's open testing track on Google Play"
            ],
            answer: 2,
            explanation: "MDM (Mobile Device Management) systems like Microsoft Intune, VMware Workspace ONE (AirWatch), or Jamf allow enterprises to distribute apps directly to managed employee devices without going through public app stores. This is the standard approach for internal banking apps."
          },
          {
            q: "Where should an Android app signing keystore be stored for use in a GitLab CI pipeline?",
            options: [
              "In the Git repository alongside the code",
              "As a base64-encoded masked/protected CI/CD variable in GitLab",
              "On a shared network drive accessible to the runner",
              "In the Dockerfile"
            ],
            answer: 1,
            explanation: "The Android keystore must NEVER be committed to Git (it would be permanently in history and expose your signing key). The secure approach is to base64-encode it, store it as a masked/protected CI/CD variable in GitLab, then decode it to a file at build time."
          }
        ]
      }
    ]
  },
  {
    id: "executive-communication",
    title: "Executive Communication",
    icon: "🎙",
    desc: "How to speak to technical and non-technical executives as a TPM",
    lessons: [
      {
        id: "exec-communication-mindset",
        title: "The Executive Mindset: What They Actually Care About",
        duration: "10 min read",
        content: `
<h3>Executives Think Differently Than Engineers</h3>
<p>Engineers optimize for correctness, completeness, and technical accuracy. Executives optimize for <strong>decisions, risk, and outcomes</strong>. When you walk into an executive meeting, you are not there to explain how something works — you are there to give them what they need to act or to confirm they don't need to act.</p>

<p>Understanding this shift is the most important communication skill you can develop as a TPM.</p>

<h3>What Every Executive Is Really Asking</h3>
<p>No matter what you're presenting, executives are filtering everything through four questions:</p>
<ol>
  <li><strong>So what?</strong> — Why does this matter to the business?</li>
  <li><strong>What's the risk?</strong> — Could this hurt us? How badly?</li>
  <li><strong>What do you need from me?</strong> — Is there a decision, resource, or unblock required?</li>
  <li><strong>Are you in control?</strong> — Do I need to worry about this, or do you have it handled?</li>
</ol>
<p>If you answer all four clearly, you've had a successful executive communication — regardless of how technical the underlying topic is.</p>

<h3>Technical Executives vs. Non-Technical Executives</h3>
<p>Many TPMs make the mistake of adjusting only vocabulary. The real adjustment is <em>depth and starting point</em>.</p>
<ul>
  <li><strong>Technical executives (CTO, VP Engineering):</strong> You can use precise terms — "pipeline failure rate," "P99 latency," "SAST scan." They will catch vague language. Lead with the problem and data, then offer to go deeper. They want accuracy.</li>
  <li><strong>Non-technical executives (CEO, CFO, Chief Risk Officer):</strong> Skip the mechanism, lead with the business impact. Don't say "our GitLab runner pool was exhausted." Say "our deployment system slowed down, which delayed the feature release by two days and pushed our customer go-live." The mechanism is your job to manage — the impact is theirs to care about.</li>
</ul>

<div class="tip"><strong>TPM Rule of Thumb:</strong> If an executive has to ask "what does that mean for us?" — you led with the wrong thing. Lead with the business impact, then offer the technical detail if asked.</div>

<h3>Reading the Room</h3>
<p>You will often be in rooms with mixed audiences — a CTO and a CFO in the same meeting. Start at the business level. If a technical executive wants to go deeper, they will ask. If you start technical, you've lost the non-technical executives before you finish your first sentence.</p>

<h3>The "Pyramid Principle"</h3>
<p>A communication framework widely used in consulting and leadership: lead with your conclusion, then support it with data. Never build up to a conclusion — executives don't have time for the journey.</p>
<ul>
  <li><strong>Wrong:</strong> "We analyzed the pipeline logs, identified three failure modes, ran root cause analysis, and after reviewing the data we concluded that we need to upgrade our runner capacity."</li>
  <li><strong>Right:</strong> "We need to upgrade our CI runner capacity — it's the root cause of our deployment slowdowns. Here's the data."</li>
</ul>`,
        takeaways: [
          "Executives filter everything through: so what, risk, what do you need, are you in control",
          "Lead with business impact, not technical mechanism — regardless of audience",
          "Technical execs want accuracy; non-technical execs want business consequences",
          "Use the Pyramid Principle: conclusion first, supporting data second",
          "Mixed audiences: always start at the business level, let technical execs pull for depth"
        ],
        resources: [
          { type: "book", title: "The Pyramid Principle", desc: "Barbara Minto — the definitive guide to executive-level structured communication", url: "https://www.amazon.com/Pyramid-Principle-Logic-Writing-Thinking/dp/0273710516" },
          { type: "article", title: "How to Communicate with Executives", desc: "Harvard Business Review — translating technical work for leadership", url: "https://hbr.org/2015/04/the-best-ways-to-deal-with-people-who-arent-tech-savvy" },
          { type: "video", title: "Executive Presence for Technical Leaders", desc: "Overview of presence and communication style for technical roles moving into leadership", url: "https://www.youtube.com/watch?v=RkbEp6JAoX8" }
        ],
        quiz: [
          {
            q: "You need to tell the CFO that a CI/CD pipeline outage delayed your release. What is the best opening sentence?",
            options: [
              "Our GitLab runner pool hit capacity limits causing pipeline queue times to spike to 45 minutes.",
              "The release of the payments feature is delayed by two days, which pushes the customer go-live to Thursday.",
              "We had a technical incident in our DevOps infrastructure that required root cause analysis.",
              "I wanted to give you a heads up about some issues we've been debugging this week."
            ],
            answer: 1,
            explanation: "The CFO cares about the business outcome — the delayed go-live — not the mechanism. Lead with the impact (two-day delay, Thursday go-live), then be ready to explain the cause if asked. Options A and C lead with technical detail. Option D is vague and buries the impact."
          },
          {
            q: "You're presenting to a mixed group: the CTO (technical) and the Chief Risk Officer (non-technical). Where should you start?",
            options: [
              "Start technical — the CTO is the most senior engineering leader in the room",
              "Start at the business impact level — let the CTO ask for technical depth if needed",
              "Prepare two separate presentations and switch between them",
              "Ask the CTO to leave the room while you brief the CRO first"
            ],
            answer: 1,
            explanation: "Always anchor to the business level first in mixed audiences. Technical executives can follow a business-level summary and will ask for depth. Non-technical executives will be lost if you open with technical detail and may disengage before you reach the part that matters to them."
          },
          {
            q: "An executive asks 'are we on track?' during a status update. What does she really want to know?",
            options: [
              "A detailed breakdown of every task and its completion percentage",
              "Whether she needs to worry about this or take action, or whether you have it under control",
              "The names of every team member working on the project",
              "A technical explanation of the blockers the team is facing"
            ],
            answer: 1,
            explanation: "Executives asking 'are we on track?' are really asking two things: do I need to act, and do I need to worry? Answer those directly: 'Yes, we're on track for the March 15 launch, no action needed from you' or 'We're at risk — I need a decision on X by Wednesday.' Don't bury the answer in a status recitation."
          },
          {
            q: "What is the Pyramid Principle?",
            options: [
              "A method for organizing teams into hierarchical reporting structures",
              "A communication approach where you lead with your conclusion, then support it with data",
              "A technique for building slide decks with exactly three levels of detail",
              "A framework for escalating issues through management layers"
            ],
            answer: 1,
            explanation: "The Pyramid Principle (Barbara Minto) says: lead with the answer/conclusion at the top, then provide the supporting arguments and data below it. The opposite — building to a conclusion — makes executives wait through context they may not need before hearing what they actually care about."
          }
        ]
      },
      {
        id: "exec-language-translation",
        title: "Translating Technical Language for Executives",
        duration: "12 min read",
        content: `
<h3>Why Technical Language Fails in Executive Rooms</h3>
<p>Technical language is precise and efficient — within a technical team. In an executive room, it does the opposite: it signals that you haven't done the work of translating your domain into business terms. The best TPMs are fluent in both languages and know which one to use.</p>

<p>This is not about "dumbing things down." It's about respecting your audience's context and time.</p>

<h3>The Translation Framework</h3>
<p>For any technical concept, ask three questions:</p>
<ol>
  <li><strong>What is the business consequence if this goes wrong?</strong></li>
  <li><strong>What does success look like to the business?</strong></li>
  <li><strong>What decision or awareness does the executive need from this?</strong></li>
</ol>
<p>Your answer to those three questions is the executive version. The technical explanation is the appendix.</p>

<h3>Common Translations: CI/CD to Executive Language</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px;margin:16px 0;">
  <thead>
    <tr style="background:var(--surface-2);text-align:left;">
      <th style="padding:10px 12px;border:1px solid var(--border);">Technical Term</th>
      <th style="padding:10px 12px;border:1px solid var(--border);">Executive Translation</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td style="padding:10px 12px;border:1px solid var(--border);">Pipeline failure</td>
      <td style="padding:10px 12px;border:1px solid var(--border);">Our automated quality check caught an issue before it reached customers — we blocked the release until it's fixed</td>
    </tr>
    <tr style="background:var(--surface-2);">
      <td style="padding:10px 12px;border:1px solid var(--border);">Deployment frequency increased from weekly to daily</td>
      <td style="padding:10px 12px;border:1px solid var(--border);">We can now deliver new features and fixes to customers 5x faster than before</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid var(--border);">MTTR dropped from 4 hours to 30 minutes</td>
      <td style="padding:10px 12px;border:1px solid var(--border);">When something breaks in production, we now restore service 8x faster — reducing customer impact</td>
    </tr>
    <tr style="background:var(--surface-2);">
      <td style="padding:10px 12px;border:1px solid var(--border);">We need to upgrade our GitLab runner fleet</td>
      <td style="padding:10px 12px;border:1px solid var(--border);">Our build infrastructure is at capacity and causing delays — I need $X to upgrade it, which will cut build times in half</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid var(--border);">SAST scan flagged a critical vulnerability</td>
      <td style="padding:10px 12px;border:1px solid var(--border);">Our automated security check found a high-severity issue — we are blocking this release until it's resolved, estimated 2 days</td>
    </tr>
    <tr style="background:var(--surface-2);">
      <td style="padding:10px 12px;border:1px solid var(--border);">Change failure rate is 12%</td>
      <td style="padding:10px 12px;border:1px solid var(--border);">About 1 in 8 releases is causing an incident — industry best practice is under 5%. We have a plan to close that gap.</td>
    </tr>
    <tr>
      <td style="padding:10px 12px;border:1px solid var(--border);">We're migrating from Jenkins to GitLab CI</td>
      <td style="padding:10px 12px;border:1px solid var(--border);">We're replacing our aging build system with a modern platform — it reduces maintenance overhead and speeds up delivery</td>
    </tr>
  </tbody>
</table>

<h3>Numbers That Resonate With Executives</h3>
<p>Not all metrics are executive-friendly. Translate engineering metrics into business metrics:</p>
<ul>
  <li><strong>Time → Revenue or Customer Impact:</strong> "Each hour of downtime costs us approximately $X in transaction volume"</li>
  <li><strong>Frequency → Speed to Market:</strong> "We now ship features 3x faster than our competitors"</li>
  <li><strong>Error rates → Risk exposure:</strong> "A 10% change failure rate means we introduce production incidents weekly"</li>
  <li><strong>Coverage → Risk reduction:</strong> "80% automated test coverage means 80% of regression risk is caught before a human touches it"</li>
</ul>

<h3>Phrases That Build Executive Confidence</h3>
<p>How you say things matters as much as what you say. These phrases signal control and credibility:</p>
<ul>
  <li>"We identified this early — before it reached customers."</li>
  <li>"We have a mitigation in place. Here's what we're doing."</li>
  <li>"The risk is bounded — worst case is X."</li>
  <li>"I need a decision from you on X by [date] — here are the options."</li>
  <li>"This is on track. No action needed from your side."</li>
</ul>

<div class="tip"><strong>Avoid these phrases with non-technical executives:</strong> "it's complicated," "the engineers are looking into it" (without a timeline), "I'm not sure yet" (without a plan for finding out). These erode confidence. Replace with bounded uncertainty: "We're investigating — I'll have an answer by 3pm today."</div>

<h3>Handling Technical Questions From Non-Technical Executives</h3>
<p>When a non-technical executive asks a question that goes deeper than they realize, don't answer at full technical depth. Use the "one layer deeper" rule: go one level more specific than your executive summary, then offer to go further if they want. Usually they don't.</p>
<p><em>Executive: "Why did the pipeline fail?"</em></p>
<p><em>Wrong: "The SAST scanner flagged a CWE-89 SQL injection vulnerability in the authentication service's user lookup function."</em></p>
<p><em>Right: "Our automated security scanner caught a code vulnerability before it could reach customers. The team is fixing it now — estimated 2 days. Do you want more detail?"</em></p>`,
        takeaways: [
          "Translation means finding the business consequence, not simplifying the technical detail",
          "Convert engineering metrics to time, money, risk, or customer impact",
          "Phrases like 'we caught this early' and 'the risk is bounded' build executive confidence",
          "Use the 'one layer deeper' rule when answering technical questions from non-technical execs",
          "Never say 'we're looking into it' without a timeline — always bound your uncertainty"
        ],
        resources: [
          { type: "article", title: "How to Talk to Non-Technical Stakeholders", desc: "Practical guide for translating engineering work into business language", url: "https://hbr.org/2022/11/how-to-explain-technical-concepts-to-non-technical-stakeholders" },
          { type: "book", title: "Crucial Conversations", desc: "Patterson et al — how to communicate clearly under pressure with senior stakeholders", url: "https://www.amazon.com/Crucial-Conversations-Talking-Stakes-Second/dp/1469266822" },
          { type: "article", title: "DORA Metrics Explained for Business Leaders", desc: "How to present DORA metrics in business terms", url: "https://dora.dev/guides/dora-metrics-four-keys/" }
        ],
        quiz: [
          {
            q: "A non-technical executive asks why the release was delayed. The real cause is 'the SAST scanner flagged a critical CVE in a third-party dependency.' What is the best executive-level answer?",
            options: [
              "Our automated security check caught a high-risk vulnerability before release — we held the release to fix it, which takes about 2 days.",
              "The SAST scanner found a CVE-9.8 in our dependency tree that required a patch and re-scan cycle.",
              "We had a security issue that's very technical and hard to explain — the engineers are handling it.",
              "The release is delayed because of a software library problem that needs updating."
            ],
            answer: 0,
            explanation: "Option A translates the mechanism into business consequence (security risk caught before customers were exposed) and gives a timeline. Option B is too technical. Option C is vague and erodes confidence. Option D is slightly better but doesn't convey the proactive catch or the concrete timeline."
          },
          {
            q: "You want to tell a CFO that MTTR improved from 4 hours to 30 minutes. What is the most effective way to frame this?",
            options: [
              "Our MTTR KPI dropped from 240 minutes to 30 minutes, an 87.5% improvement.",
              "We improved our mean time to recovery metric significantly this quarter.",
              "When something breaks in production, we now restore service 8x faster — significantly reducing customer impact and downtime risk.",
              "The engineering team implemented better monitoring and alerting to reduce incident response time."
            ],
            answer: 2,
            explanation: "Option C translates MTTR into what it means for the business: faster recovery, less customer impact. Option A uses jargon (MTTR, KPI) and raw numbers without business context. Option B is vague. Option D explains the mechanism, not the outcome."
          },
          {
            q: "Which phrase best signals control and credibility to an executive when delivering bad news?",
            options: [
              "We're still figuring out what happened.",
              "The engineers are looking into it.",
              "We identified the issue early — before it impacted customers. The risk is contained and we'll have a fix by end of day.",
              "It's complicated but we're on it."
            ],
            answer: 2,
            explanation: "Option C signals that you caught the issue proactively, bounded the risk, and have a concrete timeline. This is exactly what executives need to hear to feel confident. Options A, B, and D all express uncertainty without bounding it — they leave the executive wondering whether to escalate or intervene."
          },
          {
            q: "An executive asks a technical question that would require a 5-minute explanation to answer fully. What should you do?",
            options: [
              "Give the full technical explanation so they understand the complexity",
              "Tell them it's too technical to explain and you'll handle it",
              "Give one level more detail than your summary, then offer to go deeper if they want — usually they won't",
              "Redirect to a different topic to avoid getting into the weeds"
            ],
            answer: 2,
            explanation: "The 'one layer deeper' rule respects the executive's time while still being responsive. Most executives ask follow-up questions to gauge your understanding, not because they want the full technical deep-dive. Give enough to show command of the topic, then offer more. If they want the full story, they'll ask — and that's a good sign."
          }
        ]
      },
      {
        id: "exec-meeting-formats",
        title: "Executive Meeting Formats: Status Updates, Escalations & Ask Meetings",
        duration: "10 min read",
        content: `
<h3>Not All Executive Meetings Are the Same</h3>
<p>One of the most common mistakes TPMs make is treating every executive interaction the same way. The format, tone, and what you prepare should be completely different depending on why you're in the room.</p>

<p>There are three primary types of executive meetings you'll have as a TPM:</p>

<h3>1. The Status Update</h3>
<p>Purpose: Keep executives informed. They should leave knowing whether to worry or not.</p>
<p><strong>Structure:</strong></p>
<ul>
  <li><strong>Headline first:</strong> "We're on track / at risk / off track for [milestone] on [date]."</li>
  <li><strong>Key highlights:</strong> 2–3 things that happened since last update that they need to know</li>
  <li><strong>Risks and mitigations:</strong> What could go wrong and what you're doing about it</li>
  <li><strong>Next milestone:</strong> What you're driving toward next</li>
</ul>
<p><strong>What not to do:</strong> Don't read through a list of tasks. Don't present raw data without interpretation. Don't make them ask "so what?" — answer it preemptively.</p>
<div class="tip"><strong>Template:</strong> "We are [on track / at risk] for [outcome] on [date]. Since last week: [2-3 highlights]. Key risks: [X — mitigation: Y]. Next milestone: [Z on date]."</div>

<h3>2. The Escalation</h3>
<p>Purpose: You need awareness, a decision, or a resource unblock from someone above you. This is the most high-stakes executive interaction.</p>
<p><strong>Structure:</strong></p>
<ul>
  <li><strong>The situation:</strong> What's happening, in one sentence</li>
  <li><strong>The business impact:</strong> What happens if this isn't resolved (be specific — timelines, dollars, customers)</li>
  <li><strong>What you've already tried:</strong> Executives need to know you've exhausted what's in your control</li>
  <li><strong>What you need:</strong> Be explicit — a decision, an introduction, a budget approval, a direction call</li>
  <li><strong>Your recommendation:</strong> Don't just present the problem — have a point of view on what should happen</li>
</ul>
<p><strong>Critical rule:</strong> Never escalate without a recommendation. "I don't know what to do" erodes trust. "Here's the situation, here's what I recommend, I need you to authorize it" builds it.</p>

<h3>3. The Ask Meeting</h3>
<p>Purpose: You need something specific — budget, headcount, a decision, a priority call. This is a selling meeting, not a reporting meeting.</p>
<p><strong>Structure:</strong></p>
<ul>
  <li><strong>The problem:</strong> Set context — what constraint or opportunity is at stake</li>
  <li><strong>The ask:</strong> State it clearly and early — "I'm here to ask for X"</li>
  <li><strong>The business case:</strong> Why this investment makes sense — ROI, risk reduction, competitive advantage</li>
  <li><strong>The cost of inaction:</strong> What happens if you don't get this — deadlines slipped, risk exposure, team impact</li>
  <li><strong>The options:</strong> Give 2–3 options when possible. Executives like to choose, not just approve or reject.</li>
</ul>
<p><strong>Example ask:</strong> "I need to upgrade our CI runner infrastructure. Without it, we'll miss the Q3 delivery commitment. The cost is $X. I can bring it in under the current budget by deferring Y, or I need a $X budget increase. I recommend option 1."</p>

<h3>General Executive Meeting Principles</h3>
<ul>
  <li><strong>Bring a one-pager:</strong> A single page they can read in 60 seconds. Executives often decide before the meeting — your doc is your pre-sell.</li>
  <li><strong>The first 60 seconds matter most:</strong> Lead with the most important thing. If you run out of time, they've heard what matters.</li>
  <li><strong>Don't fill silence:</strong> Executives think out loud. If they go quiet after you speak, wait. Don't over-explain.</li>
  <li><strong>Never be surprised by your own data:</strong> Know every number you present. If they ask "what was it last quarter?" and you don't know, you lose credibility fast.</li>
</ul>`,
        takeaways: [
          "Status update: headline first — on track / at risk / off track — then highlights, risks, next milestone",
          "Escalation: situation, business impact, what you've tried, what you need, your recommendation",
          "Ask meeting: problem, explicit ask early, business case, cost of inaction, options",
          "Never escalate without a recommendation — always have a point of view",
          "First 60 seconds matter most — lead with what's most important"
        ],
        resources: [
          { type: "article", title: "How to Run an Effective Executive Status Update", desc: "Strategies for structured, credible executive communication", url: "https://hbr.org/2020/07/the-art-of-the-executive-update" },
          { type: "book", title: "Influence Without Authority", desc: "Cohen & Bradford — how TPMs drive outcomes without direct control, including upward influence", url: "https://www.amazon.com/Influence-Without-Authority-Allan-Cohen/dp/0471463302" },
          { type: "video", title: "How to Present to Executives", desc: "Practical guide to executive presentation structure and delivery", url: "https://www.youtube.com/watch?v=E6m0Rj0GE8w" }
        ],
        quiz: [
          {
            q: "You're giving a weekly status update to a VP. What should your first sentence be?",
            options: [
              "This week the team completed 14 out of 18 planned story points.",
              "I want to walk you through everything we accomplished this week.",
              "We are on track for the March 15 launch — no action needed from your side.",
              "We had some challenges this week that I want to discuss."
            ],
            answer: 2,
            explanation: "Lead with the headline: are we on track or not, and does the executive need to do anything? Option C answers both questions immediately. Options A and B make the executive wait for the conclusion. Option D is vague and signals bad news without being direct about it."
          },
          {
            q: "You need to escalate a dependency that is blocking your team and requires a VP-level conversation with another department. What should you NOT do?",
            options: [
              "State the business impact of the block clearly and specifically",
              "Describe what you've already tried to resolve it at your level",
              "Present the problem without a recommendation and ask the executive to figure out what to do",
              "Specify exactly what you need from the executive (an intro, a directive, a decision)"
            ],
            answer: 2,
            explanation: "Never escalate without a recommendation. Presenting a problem and asking the executive to solve it signals that you haven't fully engaged your own problem-solving capacity. Executives expect you to have exhausted your options and come with a specific ask and a point of view on the solution."
          },
          {
            q: "You're asking a CTO for budget to upgrade your CI infrastructure. When should you state your ask?",
            options: [
              "At the very end, after you've built up the full business case",
              "Only if they ask — let the data speak for itself",
              "Early in the meeting, then support it with the business case",
              "In the follow-up email after the meeting"
            ],
            answer: 2,
            explanation: "In an Ask meeting, state your ask early. Executives should know why they're in the room within the first minute. Building to a reveal at the end wastes their time and risks running out of time before you get to the ask. Say 'I'm here to ask for X' — then make the case."
          },
          {
            q: "An executive goes quiet after you deliver your update. What should you do?",
            options: [
              "Fill the silence by adding more detail and context",
              "Ask if they have any questions to prompt a response",
              "Wait — executives often think out loud and silence is part of their processing",
              "Apologize and ask if you've explained it clearly enough"
            ],
            answer: 2,
            explanation: "Don't fill silence. Executives often go quiet to think, and if you rush to fill it with more information you interrupt their processing and may dilute your key message. Wait. If they need more, they'll ask. Over-explaining after making a strong point often weakens it."
          }
        ]
      }
    ]
  }
];
