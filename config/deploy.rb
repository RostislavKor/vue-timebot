require 'mina/rails'
require 'mina/git'

set :application_name, 'vue-timebot'
set :domain, ''
set :user, 'dev'
set :deploy_to, "/home/dev/www/#{fetch(:application_name)}"
set :repository, ''
set :branch, 'master'

set :shared_files, fetch(:shared_files, []).push('config/prod.env.js')

# Put any custom commands you need to run at setup
# All paths in `shared_dirs` and `shared_paths` will be created on their own.
task :setup do
  # command %{rbenv install 2.3.0 --skip-existing}
end

desc "Deploys the current version to the server."
task :deploy do
  deploy do
    invoke :'git:clone'
    invoke :'deploy:link_shared_paths'
    invoke :'deploy:cleanup'

    on :launch do
      in_path(fetch(:current_path)) do
        command %{yarn install}
        command %{yarn build}
      end
    end
  end
end

