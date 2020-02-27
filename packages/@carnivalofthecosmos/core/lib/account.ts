import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { NetworkBuilder } from '@aws-cdk/aws-ec2/lib/network-util';
import { ICoreProject, ICoreAccount } from '.';
import { Role, ArnPrincipal, ManagedPolicy } from '@aws-cdk/aws-iam';

export interface AccountStackProps extends StackProps {
  cidr: string;
}

export class AccountStack extends Stack implements ICoreAccount {
  readonly Project: ICoreProject;
  readonly Name: string;
  readonly NetworkBuilder: NetworkBuilder;
  readonly CdkCrossAccountRole?: Role;

  constructor(project: ICoreProject, name: string, props: AccountStackProps) {
    super(project.Scope, `Core-${name}-Account`, {
      ...props,
      env: {
        account: props.env?.account || project.account,
        region: props.env?.region || project.region,
      },
    });

    const { cidr } = props;

    this.Project = project;
    this.Name = name;
    this.NetworkBuilder = new NetworkBuilder(cidr);

    // If cross account then create cross account role
    if (this.Project.account !== this.account) {
      this.CdkCrossAccountRole = new Role(this, 'CdkCrossAccountRole', {
        roleName: `Core-CdkCrossAccount-Role`,
        assumedBy: new ArnPrincipal(this.Project.CdkMasterRoleStaticArn),
      });
      this.CdkCrossAccountRole.addManagedPolicy(ManagedPolicy.fromAwsManagedPolicyName('AdministratorAccess'));
    }
  }
}

export class ImportedAccount extends Construct implements ICoreAccount {
  readonly Project: ICoreProject;
  readonly Name: string;
  constructor(scope: Construct, project: ICoreProject, name: string) {
    super(scope, `Core-${name}-Account`);

    this.Project = project;
    this.Name = name;
  }
}
