#!/usr/bin/env python
# coding: utf-8

# In[1]:


import requests


# In[2]:


from bs4 import BeautifulSoup


# In[3]:


topics_url = 'https://techcrunch.com/'


# In[4]:


response = requests.get(topics_url)


# In[5]:


response.status_code


# In[6]:


len(response.text)


# In[7]:


page_contents = response.text


# In[8]:


page_contents[:1000]


# In[9]:


with open('webpage.html', 'w') as f:
    f.write(page_contents)


# In[10]:


doc = BeautifulSoup(page_contents, 'html.parser')


# In[11]:


# selection_class = 'has-small-font-size wp-block-navigation-item wp-block-navigation-link'
selection_class ='wp-block-navigation-item__label'
topic_titles = doc.find_all('span' , {'class': selection_class} )[1:24]


# In[12]:


len(topic_titles)


# In[13]:


topic_titles


# In[14]:


topic_titles_final = []

for tag in topic_titles:
    if tag.text == 'More':  
        continue  
    topic_titles_final.append(tag.text)

print(topic_titles_final)


# In[15]:


len(topic_titles_final)


# In[16]:


topic_title_tag0 = topic_titles[0]


# In[17]:


topic_link_tags = doc.find_all('a', {'class': 'wp-block-navigation-item__content'})[1:23]


# In[18]:


len(topic_link_tags)


# In[19]:


topic_link_tags[0]


# In[20]:


topic0_url = "https://techcrunch.com/" + topic_link_tags[0]['href']
print(topic0_url)


# In[21]:


# topic_urls
from urllib.parse import urljoin

# Define base URL
base_url = 'https://techcrunch.com/'

# Initialize an empty list to store full URLs
topic_urls = []

# Iterate over each tag to extract the URL
for tag in topic_link_tags:
    href = tag['href']
    
    # Use urljoin to handle relative and absolute URLs
    full_url = urljoin(base_url, href)
    
    # Append the full URL to the list
    topic_urls.append(full_url)

# Print the resulting list of URLs
print(topic_urls)


# In[22]:


import pandas as pd


# In[23]:


len(topic_titles_final)


# In[24]:


len(topic_urls)


# In[25]:


topics_dict = {
    'title': topic_titles_final,
    'url': topic_urls
}

topics_df = pd.DataFrame(topics_dict)
print(topics_df)


# In[26]:


topics_dict


# In[27]:


topics_df = pd.DataFrame(topics_dict)


# In[28]:


topics_df.to_csv('topics.csv', index=None)


# In[29]:


topic_repos_dict = {
    'articleName': [],
    'repo_url': [],
    'date': [],
    'text': []
}

# Loop through each topic URL
for topic_url in topic_urls:
    response = requests.get(topic_url)
    
    if response.status_code != 200:
        print(f"Failed to retrieve {topic_url}")
        continue
    
    topic_doc = BeautifulSoup(response.text, 'html.parser')
    h2_selection_class = 'has-link-color wp-block-post-title has-h-5-font-size wp-elements-565fa7bab0152bfdca0217543865c205'
    repo_tags = topic_doc.find_all('h2', {'class': h2_selection_class})
    
    # Function to extract repo info
    def get_repo_info(h2_tag):
        a_tag = h2_tag.find('a')
        if not a_tag:
            return None, None
        username = a_tag.text.strip()
        repo_url = a_tag['href']
        return username, repo_url

    # Process each repo/article (limited to first 5 articles for each topic)
    for j in range(min(len(repo_tags), 5)):
        repo_info = get_repo_info(repo_tags[j])
        if not repo_info[1]:  # Skip if repo_url is None
            continue
        
        topic_repos_dict['articleName'].append(repo_info[0])
        topic_repos_dict['repo_url'].append(repo_info[1])

        # Fetch the article page
        article_url = repo_info[1]
        article_response = requests.get(article_url)
        
        if article_response.status_code != 200:
            print(f"Failed to retrieve article: {article_url}")
            continue
        
        article_doc = BeautifulSoup(article_response.text, 'html.parser')
        
        # Extract article text
        p_selection_class = 'wp-block-paragraph'
        article_tags = article_doc.find_all('p', {'class': p_selection_class})
        article_text = ' '.join(tag.get_text(strip=True) for tag in article_tags)
        
        # Extract article date
        time_tags = article_doc.find_all('time')
        article_date = time_tags[0].text.strip() if time_tags else "No date found"
        
        # Append the article info
        topic_repos_dict['date'].append(article_date)
        topic_repos_dict['text'].append(article_text)

# Now topic_repos_dict should have the scraped data



# In[35]:


import pandas as pd

# Combine dictionaries into a single dataframe
final_dict = {
    'topic_title': [],
    'article_title': [],
    'article_url': [],
    'article_date': [],
    'article_text': []
}

# Define number of articles per topic dynamically
articles_per_topic = 5
num_topics = len(topics_dict['title'])

# Ensure the topic_repos_dict contains enough data
total_articles = len(topic_repos_dict['articleName'])

# Iterate over topics
for i in range(num_topics):
    topic_title_draft = topics_dict['title'][i]
    
    start_index = i * articles_per_topic
    end_index = min(start_index + articles_per_topic, total_articles)  # Ensure no out-of-range access
    
    # Check if there are fewer articles for this topic
    if start_index >= total_articles:
        break  # If starting index exceeds total articles, break the loop
    
    # Loop through articles for the current topic
    for j in range(start_index, end_index):
        # Safeguard for missing or incomplete data
        if j < total_articles:
            final_dict['topic_title'].append(topic_title_draft)
            final_dict['article_title'].append(topic_repos_dict['articleName'][j])
            final_dict['article_url'].append(topic_repos_dict['repo_url'][j])
            final_dict['article_date'].append(topic_repos_dict['date'][j])
            final_dict['article_text'].append(topic_repos_dict['text'][j])

# Convert the final dictionary into a DataFrame
final_df = pd.DataFrame(final_dict)

# Export the dataframe to a CSV file
# final_df.to_csv('final_articles_techCrunch.csv', index=False)

# print("CSV file created successfully!")

final_df.to_json('final_articles_techCrunch.json', orient='records')
print("JSON file created successfully!")


# In[ ]:




