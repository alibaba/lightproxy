cask 'lightproxy' do
  version '1.1.14-beta-2'
  sha256 '5bc31a5d15ada70eca8bcf039c33f140d6ab78866eccdf904c59f0b5ba8364f2'
  # gw.alipayobjects.com/os/LightProxy was verified as official when first introduced to the cask
  url "https://gw.alipayobjects.com/os/LightProxy/84ccd20f-efdf-457d-b1e4-285b849dd64e/LightProxy.dmg"
  name 'LightProxy'
  homepage 'https://github.com/alibaba/lightproxy'

  app 'LightProxy.app'
end