import { Form, Select } from 'antd';
import React from 'react';

class InnerSettingForm extends React.Component {
    render() {
        const {
            // @ts-ignore
            // eslint-disable-next-line
            t,
        } = this.props;

        // @ts-ignore
        // eslint-disable-next-line
        const { getFieldDecorator } = this.props.form;

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
            </Form>
        );
    }
}

export const SettingForm = Form.create({
    // @ts-ignore
    updateChannel: 'stable',
})(InnerSettingForm);
