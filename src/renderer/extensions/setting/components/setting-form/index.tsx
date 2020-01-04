import { Form, Select, Button } from 'antd';
import React from 'react';
import { CoreAPI } from '../../../../core-api';
import { message } from 'antd';
import { version } from '../../../../../../package.json';
import { app } from 'electron';

class InnerSettingForm extends React.Component {
    state = {
        isUpdating: false,
    };
    componentDidMount() {
        // @ts-ignore
        // eslint-disable-next-line
        const { setFieldsValue } = this.props.form;
        const settings = CoreAPI.store.get('settings');

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
                        app.relaunch();
                        app.quit();
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
                sm: { span: 3 },
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
                <Form.Item label={t('Copyright')}>Version {version} Made by IFE with love</Form.Item>
                <Form.Item label={t('Actions')}>
                    <Button loading={this.state.isUpdating} onClick={checkUpdate} type="primary">
                        {t('Check Update')}
                    </Button>
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
