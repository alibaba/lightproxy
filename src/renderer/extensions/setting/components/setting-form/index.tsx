import { Form, Select, Button, Popover, Switch, InputNumber } from 'antd';
import React from 'react';
import { CoreAPI } from '../../../../core-api';
import { message } from 'antd';
import { version } from '../../../../../../package.json';
import { shell, remote } from 'electron';
import './index.less';

class InnerSettingForm extends React.Component {
    state = {
        isUpdating: false,
    };
    componentDidMount() {
        // @ts-ignore
        // eslint-disable-next-line
        const { setFieldsValue } = this.props.form;
        const settings = CoreAPI.store.get('settings') || {};

        if (!settings.updateChannel) {
            settings.updateChannel = 'stable';
        }

        if (!(settings.softwareWhiteList === false)) {
            settings.softwareWhiteList = true;
        }

        if (!settings.defaultPort) {
            settings.defaultPort = 12888;
        }

        if (settings) {
            setFieldsValue(settings);
        }
    }
    render() {
        const {
            // @ts-ignore
            // eslint-disable-next-line
            t,
        } = this.props;

        // @ts-ignore
        // eslint-disable-next-line
        const { getFieldDecorator } = this.props.form;

        const checkUpdate = async () => {
            this.setState({
                ...this.state,
                isUpdating: true,
            });
            try {
                const result = await CoreAPI.update();
                if (!result) {
                    message.success(t('Already latest version'));
                } else {
                    message.success(t('Update success, app will restart'));
                    setTimeout(() => {
                        remote.app.relaunch();
                        remote.app.quit();
                    }, 800);
                }
            } catch (e) {
                message.error(e.toString());
            }
            this.setState({
                ...this.state,
                isUpdating: false,
            });
        };

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 5 },
            },
            wrapperCol: {
                xs: { span: 24 },
                sm: { span: 16 },
            },
        };
        return (
            <Form {...formItemLayout}>
                <Form.Item label={t('Update Channel')}>
                    {getFieldDecorator(
                        'updateChannel',
                        {},
                    )(
                        <Select>
                            <Select.Option value="stable">{t('Stable')}</Select.Option>
                            <Select.Option value="beta">{t('Beta')}</Select.Option>
                        </Select>,
                    )}
                </Form.Item>
                <Form.Item label={t('Daily software white-list')}>
                    {getFieldDecorator('softwareWhiteList', {
                        valuePropName: 'checked',
                        initalValue: true,
                    })(<Switch />)}
                </Form.Item>

                <Form.Item label={t('Default Port')}>
                    {getFieldDecorator('defaultPort')(<InputNumber min={1024} max={65534} />)}
                </Form.Item>
                <Form.Item label={t('Copyright')}>Version {version} Made by IFE Team with love</Form.Item>
                <Form.Item label={t('Actions')}>
                    <Button className="action-btn" loading={this.state.isUpdating} onClick={checkUpdate} type="primary">
                        {t('Check Update')}
                    </Button>
                    <Popover
                        content={
                            <img src="https://img.alicdn.com/tfs/TB1mK5Ks5_1gK0jSZFqXXcpaXXa-546-720.png_350x350" />
                        }
                        title={t('Use DingTalk scan to discuss')}
                        trigger="hover"
                    >
                        <Button
                            onClick={() => {
                                shell.openExternal('https://github.com/alibaba/lightproxy');
                            }}
                            className="action-btn"
                        >
                            {t('Get Help')}
                        </Button>
                    </Popover>
                </Form.Item>
            </Form>
        );
    }
}

export const SettingForm = Form.create({
    onValuesChange(props, changedValues, allValues) {
        // @ts-ignore
        const { t } = props;
        CoreAPI.store.set('settings', allValues);
        message.destroy();
        message.success(t('Saved'));
    },
})(InnerSettingForm);
