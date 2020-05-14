cask 'lightproxy' do
  version '1.1.15'
  sha256 '0d6a265c05f6cfc97dcd39a17137934dcfc7cc249d04e9cdb9f7a91416842d0b'
  # gw.alipayobjects.com/os/LightProxy was verified as official when first introduced to the cask
  url "https://gw.alipayobjects.com/os/LightProxy/a6d8f427-0b65-4967-9354-21a0d66cf4dd/LightProxy.dmg"
  name 'LightProxy'
  homepage 'https://github.com/alibaba/lightproxy'

  app 'LightProxy.app'
end