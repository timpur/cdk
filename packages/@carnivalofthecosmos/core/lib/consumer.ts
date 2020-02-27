import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { IProject } from '@aws-cdk/aws-codebuild';
import { IRepository, Repository } from '@aws-cdk/aws-codecommit';
import {
  ICoreConsumerProject,
  ICoreConsumerAccount,
  ICoreConsumerAppEnv,
  ICoreConsumerEcsAppEnv,
  ICoreConsumerCiCd,
  IConsumerProject,
  IConsumerAccount,
  IConsumerAppEnv,
  IConsumerEcsAppEnv,
  IConsumerCiCd,
  ImportedProject,
  ImportedAccount,
  ImportedAppEnv,
  ImportedEcsAppEnv,
  ImportedCiCd,
  CdkPipeline,
} from '.';
import { Role } from '@aws-cdk/aws-iam';

export class ConsumerProjectStack extends Stack implements IConsumerProject {
  readonly Scope: Construct;
  readonly Name: string;
  readonly Core: ICoreConsumerProject;
  readonly Repo: IRepository;

  constructor(scope: Construct, name: string, props?: StackProps) {
    super(scope, `App-${name}-Project`, props);

    this.Scope = scope;
    this.Name = name;
    this.Core = new ImportedProject(this, this.account);

    this.Repo = new Repository(this, 'CdkRepo', {
      repositoryName: `app-${this.Name}-cdk-repo`.toLocaleLowerCase(),
    });
  }
}

export class ConsumerAccountStack extends Stack implements IConsumerAccount {
  readonly Project: ConsumerProjectStack;
  readonly Name: string;
  readonly Core: ICoreConsumerAccount;

  constructor(project: ConsumerProjectStack, name: string, props?: StackProps) {
    super(project.Scope, `App-${project.Name}-${name}-Account`, props);

    this.Project = project;
    this.Name = name;
    this.Core = new ImportedAccount(this, this.Project.Core, name);
  }
}

export class ConsumerAppEnvStack extends Stack implements IConsumerAppEnv {
  readonly Account: ConsumerAccountStack;
  readonly Name: string;
  readonly Core: ICoreConsumerAppEnv;

  constructor(account: ConsumerAccountStack, name: string, props?: StackProps) {
    super(account.Project.Scope, `App-${account.Project.Name}-${account.Name}-${name}-AppEnv`, props);

    this.Account = account;
    this.Name = name;
    this.Core = new ImportedAppEnv(this, this.Account.Core, this.Name);
  }
}

export class ConsumerEcsAppEnvStack extends ConsumerAppEnvStack implements IConsumerEcsAppEnv {
  readonly Core: ICoreConsumerEcsAppEnv;

  constructor(account: ConsumerAccountStack, name: string, props?: StackProps) {
    super(account, name, props);

    this.node.tryRemoveChild(this.Core.node.id);

    this.Core = new ImportedEcsAppEnv(this, this.Account.Core, this.Name);
  }
}

export class ConsumerCiCdStack extends Stack implements IConsumerCiCd {
  readonly Account: ConsumerAccountStack;
  readonly Name: string;
  readonly Core: ICoreConsumerCiCd;
  readonly DeployPipeline: CdkPipeline;
  readonly DeployProject: IProject;

  constructor(account: ConsumerAccountStack, props?: StackProps) {
    super(account.Project.Scope, `App-${account.Project.Name}-${account.Name}-CiCd`, props);

    this.Account = account;
    this.Name = 'Ci';
    this.Core = new ImportedCiCd(this, this.Account.Core);

    this.DeployPipeline = new CdkPipeline(this, 'CdkPipeline', {
      name: `App-${this.Account.Project.Name}-Cdk-Pipeline`,
      cdkRepo: this.Account.Project.Repo,
      deployRole: Role.fromRoleArn(this, 'CoreCdkMasterRole', this.Account.Project.Core.CdkMasterRoleStaticArn, {
        mutable: false,
      }),
      deployEnvs: {
        NPM_REGISTRY_API_KEY: { value: 'TODO: Key here' },
      },
      deployStacks: [`App-${this.Account.Project.Name}-*`],
    });
    this.DeployProject = this.DeployPipeline.Deploy;
  }
}
