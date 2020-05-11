cask 'lightproxy' do
  version '1.1.14'
  sha256 '4530ecd308c2b7111bc6e5e58f412e8c31575970c4b697b935ee9226484da433'
  # gw.alipayobjects.com/os/LightProxy was verified as official when first introduced to the cask
  url "https://gw.alipayobjects.com/os/LightProxy/281e16c2-affb-473a-9984-c43375a1709c/LightProxy.dmg"
  name 'LightProxy'
  homepage 'https://github.com/alibaba/lightproxy'

  app 'LightProxy.app'
end