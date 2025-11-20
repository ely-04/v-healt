module.exports = {
  plugins: [
    require('tailwindcss/nesting'),
    require('tailwindcss'),
    require('autoprefixer')({
      overrideBrowserslist: [
        '> 0.5%',
        'last 2 versions',
        'Firefox ESR',
        'not dead',
        'iOS >= 10',
        'Safari >= 10',
        'Chrome >= 54'
      ],
      // Ignorar warnings de prefijos obsoletos
      ignoreUnknownVersions: true
    }),
  ],
}
