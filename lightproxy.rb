cask 'lightproxy' do
  version '1.1.15'
  sha256 '45789e17d14c6c79c4c8d3cf74d272f1a884a80eaf8f50bb1e46e93fb1cf9512'
  # gw.alipayobjects.com/os/LightProxy was verified as official when first introduced to the cask
  url "https://gw.alipayobjects.com/os/LightProxy/736c6a6b-4cd0-473b-9d2b-8b91775088ba/LightProxy.dmg"
  name 'LightProxy'
  homepage 'https://github.com/alibaba/lightproxy'

  app 'LightProxy.app'
end