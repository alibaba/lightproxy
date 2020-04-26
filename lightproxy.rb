cask 'lightproxy' do
  version '1.1.13'
  sha256 '56c82500f8e8321dcf7418e0b4d543982b07e549c982862ea8e71276811228f6'
  # gw.alipayobjects.com/os/LightProxy was verified as official when first introduced to the cask
  url "https://gw.alipayobjects.com/os/LightProxy/c0a6584d-c3de-4e16-803d-bfc6b3746024/LightProxy.dmg"
  name 'LightProxy'
  homepage 'https://github.com/alibaba/lightproxy'

  app 'LightProxy.app'
end