import { Button, Form, Input } from 'antd'

function App() {
  const onFinish = (values) => {
    console.log('Success:', values)
  }

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>Login</h2>
      <Form onFinish={onFinish}>
        <Form.Item
          name="email"
          rules={[{ required: true, message: 'Por favor ingresa tu correo' }]}
        >
          <Input placeholder="Correo electrónico" />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: 'Por favor ingresa tu contraseña' }]}
        >
          <Input.Password placeholder="Contraseña" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Ingresar
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default App
