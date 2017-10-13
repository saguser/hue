from github import Github

gitUser = "saguser"
gitPassword = "passwd12"
gitRepo = "DPO"

repo = Github(gitUser, gitPassword).get_user().get_repo(gitRepo)


def get_file_content(filename):
    return repo.get_file_contents(filename).decoded_content


def file_update(file_path, commit_message, new_content):
    repo.update_file(file_path, commit_message, new_content, repo.get_file_contents(file_path).sha)


def file_create(file_path, commit_message, new_content, branch_name):
    repo.create_file(file_path, commit_message, new_content, branch_name)


def file_delete(file_path, commit_message):
    repo.delete_file(file_path, commit_message, repo.get_file_contents(file_path).sha)


def branch_create(tree, commit_message, feature_name):
    commit = repo.create_git_commit(tree=tree, message=commit_message, parents=[])
    feature = "refs/heads/" + feature_name
    repo.create_git_ref(ref=feature, sha=commit.sha)


def file_exists(file_path):
    try:
        return repo.get_file_contents(file_path)
    except:
        return None

