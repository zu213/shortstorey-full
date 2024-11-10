
import numpy as np
    

def katz(graph, scores, alpha=0.5, max_distance=2):
    length = len(scores)
    final_scores = np.zeros(len(scores))
    temp_alpha = 1
    for k in range(0,max_distance):
        temp_alpha *= alpha
        for i in range(0,length):
            running_score = 0
            for j in range(0,length):
                if graph[i][j] == 1:
                    running_score += temp_alpha * scores[j]
                    
            final_scores[i] += running_score
    final_scores += scores
    print(final_scores)
    
    
def basic_review_scores(graph):
    final_scores = []
    for i in graph:
        final_scores.append( np.sum(i) / sum(x != 0 for x in i))
    print(final_scores)
    return(final_scores)
                
            
    
def review_scores(graph, alpha=0.5, max_distance=2):
    temp_alpha = 1
    final_scores = basic_review_scores(graph)

    for k in range(0,max_distance):
        temp_alpha *= alpha
        for i in range(0,len(graph)):
            running_total = 0
            for j in range(0,len(graph)):
                running_total += graph[i][j] * temp_alpha * final_scores[j]
            final_scores += running_total / sum(x != 0 for x in graph[i])
        print(final_scores)
    
    
    print(final_scores)

test_graph = [[0,1,1,1],
              [1,0,0,1],
              [1,0,0,1],
              [1,1,1,0]]

test_scores = [1,2,3,4]

test_reviews = [[0,1,2,3],
              [1,0,0,1],
              [4,2,0,1],
              [1,5,1,0]]

katz(test_graph, test_scores)
review_scores(test_reviews)