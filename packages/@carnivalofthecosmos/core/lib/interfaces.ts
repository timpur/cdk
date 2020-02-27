import { Construct } from '@aws-cdk/core';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { IRepository } from '@aws-cdk/aws-codecommit';
import { IVpc } from '@aws-cdk/aws-ec2';
import { ICluster } from '@aws-cdk/aws-ecs';
import { IApplicationLoadBalancer, IApplicationListener } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IProject } from '@aws-cdk/aws-codebuild';
import { IRole } from '@aws-cdk/aws-iam';

export interface INamespace extends Construct {
  Name: string;
}

export interface IEnv {
  account?: string;
  region?: string;
}

// Core Interfaces
export interface ICoreProject extends INamespace, IEnv {
  Scope: Construct;
  Repo: IRepository;
  Zone: IHostedZone;
  CdkMasterRole: IRole;
  CdkMasterRoleStaticArn: string;
}

export interface ICoreAccount extends INamespace {
  Project: ICoreProject;
  CdkCrossAccountRole?: IRole;
}

export interface ICoreAppEnv extends INamespace {
  Account: ICoreAccount;
  Vpc: IVpc;
  Zone: IHostedZone;
}

export interface ICoreEcsAppEnv extends ICoreAppEnv {
  Cluster: ICluster;
  Alb: IApplicationLoadBalancer;
  HttpListener: IApplicationListener;
  // HttpsListener: IApplicationListener;
}

export interface ICoreCiCd extends ICoreEcsAppEnv {
  CdkDeploy?: IProject;
}

// Consumer Interfaces
export interface ICoreConsumer<T> extends INamespace {
  Core: T;
}

export interface IConsumerProject extends ICoreConsumer<ICoreProject> {
  Scope: Construct;
  Repo: IRepository;
}

export interface IConsumerAccount extends ICoreConsumer<ICoreAccount> {
  Project: IConsumerProject;
}

export interface IConsumerAppEnv extends ICoreConsumer<ICoreAppEnv> {
  Account: IConsumerAccount;
}

export interface IConsumerEcsAppEnv extends IConsumerAppEnv {
  Core: ICoreEcsAppEnv;
}

export interface IConsumerCiCd extends IConsumerEcsAppEnv {
  Core: ICoreCiCd;
  DeployProject: IProject;
}
