import {
    Button,
    Menu,
    Dropdown,
    Icon,
} from 'antd';

import React from 'react';
import { remote } from 'electron';
import { useTranslation } from 'react-i18next';

const handleHomepage = () => remote.shell.openExternal('https://lightproxy.org?from=desktop');
const handleIssue = () => remote.shell.openExternal('https://github.com/alibaba/lightproxy/issues');
const handleGithub = () => remote.shell.openExternal('https://github.com/alibaba/lightproxy');

export const HelperButton = () => {
    const [t] = useTranslation();
    const menu = (
        <Menu>
          <Menu.Item onClick={handleHomepage}>
            <Icon type="home" />
            {t('Home Page & Document')}
          </Menu.Item>
          <Menu.Item onClick={handleIssue}>
            <Icon type="bug" />
            {t('Report issue')}
          </Menu.Item>
          <Menu.Item onClick={handleGithub}>
            <Icon type="github" />
            {t('Github')}
          </Menu.Item>
        </Menu>
    );
    return <div className="lightproxy-helper-button">
        <Dropdown overlay={menu}>
            <Button onClick={handleHomepage} shape="circle" icon="message">
            </Button>
        </Dropdown>
    </div>
};