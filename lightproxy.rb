cask 'lightproxy' do
  version '1.1.12'
  sha256 '5d2979777be073eb2a87889c3852eceb65642ca0675971a41e4b9b2c9f2e6cfa'
  # gw.alipayobjects.com/os/LightProxy was verified as official when first introduced to the cask
  url "https://gw.alipayobjects.com/os/LightProxy/ccc1c3ad-c89d-469f-b6fe-e91c3e2734ac/LightProxy.dmg"
  name 'LightProxy'
  homepage 'https://github.com/alibaba/lightproxy'

  app 'LightProxy.app'
end