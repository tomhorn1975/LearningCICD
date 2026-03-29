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
  }
];
