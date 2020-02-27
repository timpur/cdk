#!/usr/bin/env node
import 'source-map-support/register';
import { App } from '@aws-cdk/core';
import { ProjectStack, AccountStack, EcsAppEnvStack } from '../../lib/index';

const app = new App();

const projectStack = new ProjectStack(app, 'Devops', {
  tld: 'carnivalofthecosmos.com',
  env: { account: '868652293535' },
});

new AccountStack(projectStack, 'Sandbox', {
  cidr: '10.0.0.0/22',
});

new AccountStack(projectStack, 'Dev', {
  cidr: '10.0.0.0/22',
  env: { account: '855215228333' },
});

// const devEcsAppEnv = new EcsAppEnvStack(mgtAccount, 'Dev', {
//   networkBuilder: mgtAccount.NetworkBuilder,
// });

// const tstAppEnv = new EcsAppEnvStack(mgtAccount, 'Tst');
