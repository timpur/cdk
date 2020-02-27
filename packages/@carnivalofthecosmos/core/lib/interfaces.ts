import { Construct } from '@aws-cdk/core';
import { IHostedZone } from '@aws-cdk/aws-route53';
import { IRepository } from '@aws-cdk/aws-codecommit';
import { IVpc } from '@aws-cdk/aws-ec2';
import { ICluster } from '@aws-cdk/aws-ecs';
import { IApplicationLoadBalancer, IApplicationListener } from '@aws-cdk/aws-elasticloadbalancingv2';
import { IProject } from '@aws-cdk/aws-codebuild';
import { IRole } from '@aws-cdk/aws-iam';

// Common
export interface INamespace extends Construct {
  Name: string;
}

export interface IEnv {
  account?: string;
  region?: string;
}

// Core Interfaces

// Core Project
export interface ICoreConsumerProject extends INamespace, IEnv {
  Repo: IRepository;
  Zone: IHostedZone;
  CdkMasterRoleStaticArn: string;
}
export interface ICoreProject extends ICoreConsumerProject {
  Scope: Construct;
  Accounts: ICoreAccount[];
  CdkMasterRole: IRole;
}

// Core Account
export interface ICoreConsumerAccount extends INamespace, IEnv {
  Project: ICoreConsumerProject;
}
export interface ICoreAccount extends ICoreConsumerAccount {
  Project: ICoreProject;
  AppEnvs: ICoreAppEnv[];
  CdkCrossAccountRole?: IRole;
}

// Core App Env
export interface ICoreConsumerAppEnv extends INamespace, IEnv {
  Account: ICoreConsumerAccount;
  Vpc: IVpc;
  Zone: IHostedZone;
}
export interface ICoreAppEnv extends ICoreConsumerAppEnv {
  Account: ICoreAccount;
}

// Core Ecs App Env
export interface ICoreConsumerEcsAppEnv extends ICoreConsumerAppEnv {
  Cluster: ICluster;
  Alb: IApplicationLoadBalancer;
  HttpListener: IApplicationListener;
  // HttpsListener: IApplicationListener;
}
export interface ICoreEcsAppEnv extends ICoreConsumerEcsAppEnv, ICoreAppEnv {
  Account: ICoreAccount;
}

// Core CiCd
export interface ICoreConsumerCiCd extends ICoreConsumerEcsAppEnv {}
export interface ICoreCiCd extends ICoreConsumerCiCd, ICoreEcsAppEnv {
  Account: ICoreAccount;
  CdkDeploy: IProject;
}

// Consumer Interfaces
export interface ICoreConsumer<T> extends INamespace {
  Core: T;
}

export interface IConsumerProject extends ICoreConsumer<ICoreConsumerProject> {
  Scope: Construct;
  Repo: IRepository;
}

export interface IConsumerAccount extends ICoreConsumer<ICoreConsumerAccount> {
  Project: IConsumerProject;
}

export interface IConsumerAppEnv extends ICoreConsumer<ICoreConsumerAppEnv> {
  Account: IConsumerAccount;
}

export interface IConsumerEcsAppEnv extends IConsumerAppEnv, ICoreConsumer<ICoreConsumerEcsAppEnv> {
  Core: ICoreConsumerEcsAppEnv;
}

export interface IConsumerCiCd extends IConsumerEcsAppEnv, ICoreConsumer<ICoreConsumerCiCd> {
  Core: ICoreConsumerCiCd;
  DeployProject: IProject;
}
