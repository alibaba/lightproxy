cask 'lightproxy' do
  version '1.1.11'
  sha256 '6c8be69236e3b9f4ba64370666fd30287e84cd7e67911908580aa13af2c0e8e3'
  # gw.alipayobjects.com/os/LightProxy was verified as official when first introduced to the cask
  url "https://gw.alipayobjects.com/os/LightProxy/f6abdcc2-9c52-4bcd-9fa3-e100013c57da/LightProxy.dmg"
  name 'LightProxy'
  homepage 'https://github.com/alibaba/lightproxy'

  app 'LightProxy.app'
end